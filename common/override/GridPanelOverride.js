Ext.override(Ext.grid.Panel, {
    /**
   * grid的每一列只有一个Editor，并不是一个Cell一个Editor
   * 每列公用一个Editor，导致编辑到下一行的时候，Editor被复用到了下一行的单元格，
   * 导致上一个单元格的格式被取消，标记被取消。

   * Grid和CellEditing是一对一的关系,
   * Grid.Column共用同一个CellEditing,
   * 每一个Column一个Editor,
   * 一个Editor对应一个field

   * 涉及的类包括：
   *    Ext.grid.plugin.Editing
   *    Ext.grid.plugin.CellEditing
   *    Ext.grid.CellEditor
   *    Ext.Editor
   */
    isValid: function () {
        var store = this.getStore(),
            record,
            res = true,
            columns = this.columns,
            col, slen, clen, i, j;

        for (i = 0, slen = store.getCount() ; i < slen; i++) {
            for (j = 0, clen = columns.length; j < clen; j++) { // 逐行的验证
                record = store.getAt(i);
                col = columns[j];
                if (!col.getEditor(record)) { // 某列不可编辑，则进行下一列的验证
                    continue;
                }
                if (!this.validCell(record, col)) { // 如果某个单元格验证失败，则返回
                    return false;
                }
            }
        }
        return res;
    },
    validCell: function (record, column) {
        var editor = this.getCellRowEditor(),
            cellEditor,
            field, flag;
        if (editor == null) {
            return true;
        }
        cellEditor = editor.getEditor(record, column);
        if (cellEditor) { // 判断某列是否设置了editor
            field = cellEditor.field;
            editor.startEdit(record, column); // 触发验证事件
            cellEditor.revertInvalid = false;
            flag = field.isValid();
            editor.completeEdit();
            return flag;
        }
        return true;
    },
    /**
    * 返回grid绑定的第一个CellEditing或rowediting插件
    */
    getCellRowEditor: function(){
        var plugins = this.plugins;
        for (var i = 0, len = plugins.length; i < len; i++) {
            if (plugins[i].ptype === 'cellediting' || plugins[i].ptype === 'rowediting') {
                return plugins[i];
            }
        }
        return null;
    },
    firstEditCellFocus: function () {
        var editor = this.getCellRowEditor(),
            columns = this.columns,
            column,
            store = this.getStore(),
            record,clen, i;
        if (store && store.getAt(0)) {
            record = store.getAt(0);
            for (i = 0, clen = columns.length; i < clen; i++) {
                column = columns[i];
                if (column.getEditor(record)) {
                    editor.startEdit(record, column);
                    break;
                }
            }
        }
    }
});