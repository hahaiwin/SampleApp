Ext.override(Ext.data.Model, {
    copy: function (newId) {
        var me = this;
        var copy = new me.self(me.raw, newId, null, Ext.apply({}, me[me.persistenceProperty]));
        this.associations.each(function (association) {
            if (association.type == 'hasMany') {
                var associationStore = this[association.name]();
                associationStore.each(function (record) {
                    var childCopy = record.copy();
                    Ext.data.Model.id(childCopy);
                    copy[association.name]().add(childCopy);
                });
            }
            else if (association.type == 'hasOne') {
                var childAssociation = this[association.getterName]();
                var childCopy = childAssociation.copy();
                copy[association.setterName](childCopy);
            }
        }, me);

        return copy;
    } 
});