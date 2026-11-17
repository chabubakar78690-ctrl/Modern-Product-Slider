<?php
/**
 * Plugin Name:       Modern Product Slider
 * Plugin URI:        https://modern-product-slider.vercel.app/
 * Description:       Beautiful, fast WooCommerce product sliders. Add sliders with a shortcode or Gutenberg block. Pro unlocks unlimited sliders, products per rack and priority support.
 * Version:           1.0.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            Modern Product Slider
 * Author URI:        https://modern-product-slider.vercel.app/
 * License:           GPLv2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       modern-product-slider
 * WC requires at least: 6.0
 * WC tested up to:   8.9
 */

if (!defined('ABSPATH')) exit;

define('MPS_VERSION', '1.0.0');
define('MPS_PLUGIN_FILE', __FILE__);
define('MPS_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('MPS_PLUGIN_URL', plugin_dir_url(__FILE__));
define('MPS_API_BASE', apply_filters('mps_api_base', 'https://modern-product-slider.vercel.app'));

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function mps_site_domain() {
    $host = parse_url(get_site_url(), PHP_URL_HOST);
    return $host ? strtolower($host) : '';
}

function mps_api_post($path, $body) {
    $res = wp_remote_post(MPS_API_BASE . $path, array(
        'timeout' => 15,
        'headers' => array('Content-Type' => 'application/json'),
        'body'    => wp_json_encode($body),
    ));
    if (is_wp_error($res)) return array('error' => $res->get_error_message());
    $data = json_decode(wp_remote_retrieve_body($res), true);
    return is_array($data) ? $data : array('error' => 'Unexpected response from server.');
}

function mps_license() {
    return array(
        'key'    => (string) get_option('mps_license_key', ''),
        'status' => (string) get_option('mps_license_status', 'inactive'),
    );
}

/* ------------------------------------------------------------------ */
/* Slider shortcode + block                                           */
/* ------------------------------------------------------------------ */

function mps_enqueue_slider_assets() {
    wp_enqueue_style('mps-slider', MPS_PLUGIN_URL . 'assets/slider.css', array(), MPS_VERSION);
    wp_enqueue_script('mps-slider', MPS_PLUGIN_URL . 'assets/slider.js', array(), MPS_VERSION, true);
}

function mps_render_slider($atts) {
    if (!class_exists('WooCommerce')) {
        return '<p class="mps-notice">Modern Product Slider needs WooCommerce to show products. Please install and activate WooCommerce first.</p>';
    }
    $atts = shortcode_atts(array(
        'limit'    => 8,
        'columns'  => 4,
        'category' => '',
        'orderby'  => 'date',
        'order'    => 'DESC',
    ), $atts, 'modern_product_slider');

    $query_args = array(
        'post_type'      => 'product',
        'posts_per_page' => max(1, (int) $atts['limit']),
        'orderby'        => sanitize_key($atts['orderby']),
        'order'          => strtoupper($atts['order']) === 'ASC' ? 'ASC' : 'DESC',
        'post_status'    => 'publish',
    );
    if (!empty($atts['category'])) {
        $query_args['tax_query'] = array(array(
            'taxonomy' => 'product_cat',
            'field'    => 'slug',
            'terms'    => array_map('sanitize_title', explode(',', $atts['category'])),
        ));
    }
    $products = new WP_Query($query_args);
    if (!$products->have_posts()) {
        return '<p class="mps-notice">No products found for this slider yet.</p>';
    }

    mps_enqueue_slider_assets();
    $cols = max(1, min(6, (int) $atts['columns']));
    ob_start();
    ?>
    <div class="mps-slider" data-columns="<?php echo esc_attr($cols); ?>">
        <button type="button" class="mps-nav mps-prev" aria-label="Previous products">&#8249;</button>
        <div class="mps-track">
            <?php while ($products->have_posts()) : $products->the_post(); global $product; ?>
                <article class="mps-card">
                    <a href="<?php the_permalink(); ?>" class="mps-thumb">
                        <?php echo $product->get_image('woocommerce_thumbnail'); ?>
                    </a>
                    <h3 class="mps-name"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
                    <div class="mps-price"><?php echo $product->get_price_html(); ?></div>
                    <a href="<?php echo esc_url($product->add_to_cart_url()); ?>" class="mps-cart">Add to cart</a>
                </article>
            <?php endwhile; wp_reset_postdata(); ?>
        </div>
        <button type="button" class="mps-nav mps-next" aria-label="Next products">&#8250;</button>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode('modern_product_slider', 'mps_render_slider');

/* Gutenberg block (server-side rendered, no build step needed). */
function mps_register_block() {
    wp_register_script(
        'mps-block',
        MPS_PLUGIN_URL . 'assets/block.js',
        array('wp-blocks', 'wp-element', 'wp-components', 'wp-block-editor'),
        MPS_VERSION,
        true
    );
    register_block_type('modern-product-slider/slider', array(
        'editor_script'   => 'mps-block',
        'render_callback' => 'mps_render_slider',
        'attributes'      => array(
            'limit'    => array('type' => 'number', 'default' => 8),
            'columns'  => array('type' => 'number', 'default' => 4),
            'category' => array('type' => 'string', 'default' => ''),
        ),
    ));
}
add_action('init', 'mps_register_block');

/* ------------------------------------------------------------------ */
/* Admin: License / Connect page                                       */
/* ------------------------------------------------------------------ */

function mps_admin_menu() {
    add_menu_page(
        'Modern Product Slider',
        'Product Slider',
        'manage_options',
        'modern-product-slider',
        'mps_admin_page',
        'dashicons-slides',
        56
    );
}
add_action('admin_menu', 'mps_admin_menu');

function mps_admin_page() {
    if (!current_user_can('manage_options')) return;
    $lic = mps_license();
    $message = '';

    if (isset($_POST['mps_license_nonce']) && wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['mps_license_nonce'])), 'mps_license')) {
        $action = isset($_POST['mps_deactivate']) ? 'deactivate' : 'activate';
        $key = strtoupper(sanitize_text_field(wp_unslash($_POST['mps_license_key'] ?? $lic['key'])));
        if ($action === 'activate') {
            if (!$key) {
                $message = 'Enter your license key first. You can copy it from your dashboard: Licenses page.';
            } else {
                $res = mps_api_post('/api/license/activate', array('key' => $key, 'domain' => mps_site_domain()));
                if (!empty($res['ok'])) {
                    update_option('mps_license_key', $key);
                    update_option('mps_license_status', 'active');
                    $message = 'Connected — your site is now linked to the Modern Product Slider dashboard and Pro is active here.';
                } else {
                    $message = 'Could not connect: ' . esc_html($res['error'] ?? 'the key was not accepted for this domain.');
                }
            }
        } else {
            $res = mps_api_post('/api/license/deactivate', array('key' => $lic['key'], 'domain' => mps_site_domain()));
            update_option('mps_license_status', 'inactive');
            $message = 'License deactivated on this site. The plugin keeps working as the Free version.';
        }
        $lic = mps_license();
    }
    ?>
    <div class="wrap">
        <h1>Modern Product Slider</h1>
        <p>Show your WooCommerce products in a beautiful slider. Use the shortcode <code>[modern_product_slider limit="8" columns="4"]</code> or add the “Product Slider” block in the editor.</p>
        <?php if ($message) : ?><div class="notice notice-info"><p><?php echo wp_kses_post($message); ?></p></div><?php endif; ?>

        <h2>Connect your site</h2>
        <p>Your site: <code><?php echo esc_html(mps_site_domain()); ?></code> &nbsp;·&nbsp; Plugin version: <code><?php echo esc_html(MPS_VERSION); ?></code> &nbsp;·&nbsp; Status:
            <?php if ($lic['status'] === 'active') : ?><strong style="color:#15803d">Connected — Pro active</strong>
            <?php else : ?><strong>Free version — no license connected</strong><?php endif; ?>
        </p>
        <form method="post">
            <?php wp_nonce_field('mps_license', 'mps_license_nonce'); ?>
            <table class="form-table">
                <tr>
                    <th><label for="mps_license_key">License key</label></th>
                    <td>
                        <input type="text" id="mps_license_key" name="mps_license_key" value="<?php echo esc_attr($lic['key']); ?>" class="regular-text" placeholder="MPS-XXXX-XXXX-XXXX" />
                        <p class="description">Copy the key from your dashboard (Licenses page) after buying a plan. Connecting here links this WordPress site to your dashboard account.</p>
                    </td>
                </tr>
            </table>
            <?php if ($lic['status'] === 'active') : ?>
                <p><button type="submit" name="mps_deactivate" value="1" class="button">Deactivate license</button></p>
            <?php else : ?>
                <p><button type="submit" class="button button-primary">Connect site &amp; activate Pro</button></p>
            <?php endif; ?>
        </form>

        <h2>How to use</h2>
        <ol>
            <li>Add the shortcode <code>[modern_product_slider]</code> to any page, post or widget.</li>
            <li>Or add the “Product Slider” block in the block editor and set the number of products and columns.</li>
            <li>Free version: limited sliders. Pro (after connecting a license): unlimited sliders and products per rack, plus updates from your dashboard.</li>
        </ol>
        <p><a href="<?php echo esc_url(MPS_API_BASE); ?>" target="_blank">Open your Modern Product Slider dashboard &rarr;</a></p>
    </div>
    <?php
}

/* ------------------------------------------------------------------ */
/* Update checker — new releases published on the dashboard show up    */
/* in WordPress → Dashboard → Updates, like any other plugin.          */
/* ------------------------------------------------------------------ */

function mps_latest_free_release() {
    $cached = get_transient('mps_free_release');
    if (is_array($cached)) return $cached;
    $res = wp_remote_get(MPS_API_BASE . '/api/free-plugin', array('timeout' => 10));
    if (is_wp_error($res)) return null;
    $data = json_decode(wp_remote_retrieve_body($res), true);
    if (!is_array($data) || empty($data['latest_version'])) return null;
    set_transient('mps_free_release', $data, 12 * HOUR_IN_SECONDS);
    return $data;
}

function mps_check_for_updates($transient) {
    if (empty($transient->checked)) return $transient;
    $latest = mps_latest_free_release();
    if (!$latest) return $transient;
    if (version_compare($latest['latest_version'], MPS_VERSION, '>')) {
        $transient->response['modern-product-slider/modern-product-slider.php'] = (object) array(
            'slug'        => 'modern-product-slider',
            'plugin'      => 'modern-product-slider/modern-product-slider.php',
            'new_version' => $latest['latest_version'],
            'url'         => MPS_API_BASE,
            'package'     => MPS_API_BASE . '/api/free-download',
        );
    }
    return $transient;
}
add_filter('pre_set_site_transient_update_plugins', 'mps_check_for_updates');

function mps_plugin_info($result, $action, $args) {
    if ($action !== 'plugin_information' || empty($args->slug) || $args->slug !== 'modern-product-slider') return $result;
    $latest = mps_latest_free_release();
    if (!$latest) return $result;
    return (object) array(
        'name'          => 'Modern Product Slider',
        'slug'          => 'modern-product-slider',
        'version'       => $latest['latest_version'],
        'author'        => 'Modern Product Slider',
        'homepage'      => MPS_API_BASE,
        'download_link' => MPS_API_BASE . '/api/free-download',
        'sections'      => array(
            'description' => 'Beautiful, fast WooCommerce product sliders.',
            'changelog'   => !empty($latest['notes']) ? esc_html($latest['notes']) : '',
        ),
    );
}
add_filter('plugins_api', 'mps_plugin_info', 10, 3);

/* "Check for updates" — clear the cached release info on demand. */
function mps_clear_update_cache() {
    delete_transient('mps_free_release');
}
add_action('upgrader_process_complete', 'mps_clear_update_cache');
