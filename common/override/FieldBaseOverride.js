Ext.override(Ext.form.field.Base, {
    // private
    initComponent: function () {
        var me = this;

        me.callParent();

        me.subTplData = me.subTplData || {};

        me.addEvents(
        /**
        * @event specialkey
        * Fires when any key related to navigation (arrows, tab, enter, esc, etc.) is pressed. To handle other keys
        * see {@link Ext.util.KeyMap}. You can check {@link Ext.EventObject#getKey} to determine which key was
        * pressed. For example:
        *
        *     var form = new Ext.form.Panel({
        *         ...
        *         items: [{
        *                 fieldLabel: 'Field 1',
        *                 name: 'field1',
        *                 allowBlank: false
        *             },{
        *                 fieldLabel: 'Field 2',
        *                 name: 'field2',
        *                 listeners: {
        *                     specialkey: function(field, e){
        *                         // e.HOME, e.END, e.PAGE_UP, e.PAGE_DOWN,
        *                         // e.TAB, e.ESC, arrow keys: e.LEFT, e.RIGHT, e.UP, e.DOWN
        *                         if (e.{@link Ext.EventObject#getKey getKey()} == e.ENTER) {
        *                             var form = field.up('form').getForm();
        *                             form.submit();
        *                         }
        *                     }
        *                 }
        *             }
        *         ],
        *         ...
        *     });
        *
        * @param {Ext.form.field.Base} this
        * @param {Ext.EventObject} e The event object
        */
            'specialkey',

        /**
        * @event writeablechange
        * Fires when this field changes its read-only status.
        * @param {Ext.form.field.Base} this
        * @param {Boolean} Read only flag
        */
            'writeablechange'
        );

        // Init mixins
        me.initLabelable();
        me.initField();

        // Default name to inputId
        if (!me.name) {
            me.name = me.getInputId();
        }
        // Add to protoEl before render
        if (me.readOnly) {
            me.addCls(me.readOnlyCls);
        }

        if (me.forbidBlankAndShowStar) {
            me.showStar = true;
            me.allowBlank = false;
        }

        me.addCls(Ext.baseCSSPrefix + 'form-type-' + me.inputType);
    },
    // private
    onRender: function () {
        var me = this;
        this.callParent(arguments);

        if (me.showStar) {
            var txt = document.createElement("span"),
                redStar = document.createTextNode('*');
            txt.setAttribute("style", "color:red; display: table-cell;vertical-align: middle;");
            txt.appendChild(redStar);
            //console.log(me.el.dom.childNodes[0]);
            if (me.el.dom.childNodes[0].childNodes[0].getAttribute('class') === "x-form-item-input-row") {
                me.el.dom.childNodes[0].childNodes[0].appendChild(txt);
            } else {
                me.el.dom.childNodes[0].appendChild(txt);
            }
            //console.log(me.el.dom.childNodes[0].childNodes[0]);
            
        }

        this.renderActiveError();
    }
});