/*
	Qookery - Declarative UI Building for Qooxdoo

	Copyright (c) Ergobyte Informatics S.A., www.ergobyte.gr

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

		http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/

qx.Class.define("qookery.internal.components.ListComponent", {

	extend: qookery.internal.components.EditableComponent,

	construct: function(parentComponent) {
		this.base(arguments, parentComponent);
		this.__listItemsMap = { };
	},

	members: {

		__listItemsMap: null,

		_createMainWidget: function(attributes) {
			var list = new qx.ui.form.List();
			list.setScrollbarX(this.getAttribute("scrollbar-x", "auto"));
			list.setScrollbarY(this.getAttribute("scrollbar-y", "auto"));
			list.setSelectionMode(this.getAttribute("selection-mode", "single"));
			list.addListener("changeSelection", function(event) {
				if(this._disableValueEvents) return;
				var selection = event.getData();
				switch(this.getMainWidget().getSelectionMode()) {
				case "single": case "one":
					var item = selection[0];
					this.setValue(item ? item.getModel() : null);
					return;
				case "multi": case "additive":
					var value = selection.map(function(item) {
						return item.getModel();
					});
					this.setValue(value.length > 0 ? value : null);
					return;
				}
			}, this);
			this._applyLayoutAttributes(list, attributes);
			return list;
		},

		_updateUI: function(value) {
			if(!value) {
				this.getMainWidget().resetSelection();
				return;
			}
			var selection = [ ];
			switch(this.getMainWidget().getSelectionMode()) {
			case "single": case "one":
				var item = this.__findItem(value);
				if(item) selection.push(item);
				break;
			case "multi": case "additive":
				for(var i = 0; i < value.length; i++) {
					var item = this.__findItem(value[i]);
					if(item) selection.push(item);
				}
				break;
			}

			if(selection.length > 0)
				this.getMainWidget().setSelection(selection);
			else
				this.getMainWidget().resetSelection();
		},

		addItem: function(model, label, icon) {
			if(!label) label = this._getLabelOf(model);
			var item = new qx.ui.form.ListItem(label, icon, model);
			this.getMainWidget().add(item);
		},

		setItems: function(items) {
			this.removeAllItems();
			if(items instanceof qx.data.Array) items = items.toArray();
			if(qx.lang.Type.isArray(items)) {
				for(var i = 0; i < items.length; i++) {
					var model = items[i];
					this.addItem(model);
				}
			}
			else if(qx.lang.Type.isObject(items)) {
				for(var model in items) {
					var label = items[model];
					this.addItem(model, qx.data.Conversion.toString(label));
				}
			}
		},

		removeAllItems: function() {
			this.getMainWidget().removeAll();
		},

		__findItem: function(model) {
			var items = this.getMainWidget().getChildren();
			var modelProvider = this.getForm().getModelProvider();
			for(var i = 0; i < items.length; i++) {
				var item = items[i];
				var model2 = item.getModel();
				if(!modelProvider.areEqual(model, model2)) continue;
				return item;
			}
		}
	}
});
