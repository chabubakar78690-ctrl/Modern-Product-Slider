/* Modern Product Slider — Gutenberg block (server-side rendered). */
(function (blocks, element, blockEditor, components) {
  var el = element.createElement;
  var InspectorControls = blockEditor.InspectorControls;
  var PanelBody = components.PanelBody;
  var RangeControl = components.RangeControl;
  var TextControl = components.TextControl;

  blocks.registerBlockType('modern-product-slider/slider', {
    title: 'Product Slider',
    icon: 'slides',
    category: 'widgets',
    attributes: {
      limit: { type: 'number', default: 8 },
      columns: { type: 'number', default: 4 },
      category: { type: 'string', default: '' }
    },
    edit: function (props) {
      var attrs = props.attributes;
      var set = props.setAttributes;
      return el('div', {},
        el(InspectorControls, {},
          el(PanelBody, { title: 'Slider settings', initialOpen: true },
            el(RangeControl, { label: 'Products to show', value: attrs.limit, min: 1, max: 24, onChange: function (v) { set({ limit: v }); } }),
            el(RangeControl, { label: 'Columns', value: attrs.columns, min: 1, max: 6, onChange: function (v) { set({ columns: v }); } }),
            el(TextControl, { label: 'Product category slug (optional)', value: attrs.category, onChange: function (v) { set({ category: v }); } })
          )
        ),
        el('div', { style: { border: '1.5px dashed #0ea5e9', borderRadius: '12px', padding: '18px', textAlign: 'center', color: '#075985', background: '#eef7ff' } },
          el('strong', {}, 'Modern Product Slider'),
          el('p', { style: { margin: '6px 0 0' } }, 'Showing ' + attrs.limit + ' products in ' + attrs.columns + ' columns' + (attrs.category ? ' from “' + attrs.category + '”' : '') + '. Preview it on the front end.')
        )
      );
    },
    save: function () { return null; }
  });
})(window.wp.blocks, window.wp.element, window.wp.blockEditor, window.wp.components);
