Ext.override(Ext.data.TreeStore, {
    fillNode: function (node, newNodes) {
        var me = this,
            ln = newNodes ? newNodes.length : 0,
            sorters = me.sorters,
            i, sortCollection,
            needsIndexSort = false,
            performLocalSort = ln && me.sortOnLoad && !me.remoteSort && sorters && sorters.items && sorters.items.length,
            node1, node2, rootFill, root;


        for (i = 1; i < ln; i++) {
            node1 = newNodes[i];
            node2 = newNodes[i - 1];
            needsIndexSort = node1[node1.persistenceProperty].index != node2[node2.persistenceProperty].index;
            if (needsIndexSort) {
                break;
            }
        }


        if (performLocalSort) {

            if (needsIndexSort) {
                me.sorters.insert(0, me.indexSorter);
            }
            sortCollection = new Ext.util.MixedCollection();
            sortCollection.addAll(newNodes);
            sortCollection.sort(me.sorters.items);
            newNodes = sortCollection.items;


            me.sorters.remove(me.indexSorter);
        } else if (needsIndexSort) {
            Ext.Array.sort(newNodes, me.sortByIndex);
        }

        node.set('loaded', true);


        rootFill = me.fillCount === 0;
        if (rootFill) {
            me.fireEvent('beforefill', me, node, newNodes);
        }
        ++me.fillCount;

        if (newNodes.length) {
            node.appendChild(newNodes, undefined, true);
            root = this.getRootNode();
            if (root.raw.loadOnce) { // 一次性加载、解析,注意：只支持二级
                for (var k = 0; k < newNodes.length; k++) {
                    var chirldren = newNodes[k].data.children;
                    if (chirldren && chirldren.length) {
                        newNodes[k].appendChild(chirldren, undefined, true);
                    }
                }
            }
        }

        if (rootFill) {
            me.fireEvent('fillcomplete', me, node, newNodes);
        }
        --me.fillCount;

        return newNodes;
    }
});