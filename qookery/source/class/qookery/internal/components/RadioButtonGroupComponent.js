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

qx.Class.define("qookery.internal.components.RadioButtonGroupComponent", {

	extend: qookery.internal.components.EditableComponent,
	implement: [ qookery.IContainerComponent ],

	construct: function(parentComponent) {
		this.base(arguments, parentComponent);
	},

	members: {

		// Metadata

		getAttributeType: function(attributeName) {
			switch(attributeName) {
			case "allow-empty-selection": return "Boolean";
			default: return this.base(arguments, attributeName);
			}
		},

		// Creation

		_createMainWidget: function(attributes) {
			var orientation = this.getAttribute("orientation", "horizontal");
			var layoutClass =
				orientation === "horizontal" ? qx.ui.layout.HBox :
				orientation === "vertical" ? qx.ui.layout.VBox : null;
			if(!layoutClass) throw new Error("Orientation must be 'horizontal' or 'vertical'");
			var layout = new layoutClass(this.getAttribute("spacing", 5));

			var radioButtonGroup = new qx.ui.form.RadioButtonGroup(layout);
			radioButtonGroup.getRadioGroup().setAllowEmptySelection(this.getAttribute("allow-empty-selection", false));
			radioButtonGroup.addListener("changeSelection", function(event) {
				if(this._disableValueEvents) return;
				var selection = event.getData();
				var model = selection.length !== 1 ? null : selection[0].getModel();
				this.setValue(model);
			}, this);

			this._applyLayoutAttributes(radioButtonGroup, attributes);
			return radioButtonGroup;
		},

		// Public methods

		setItems: function(items) {
			this.__removeAllGroupItems();
			if(!items) return;
			if(items instanceof qx.data.Array) {
				items = items.toArray();
			}
			if(qx.lang.Type.isArray(items)) {
				items.map(function(model) {
					var label = this._getLabelOf(model);
					this.__addGroupItem(model, label);
				}, this);
			}
			else if(qx.lang.Type.isObject(items)) {
				for(var model in items) {
					var label = items[model];
					this.__addGroupItem(model, label);
				}
			}
			else throw new Error("Items are of unsupported type");
		},

		setSelection: function(itemNumber) {
			var selectablesItems = this.getMainWidget().getSelectables(true);
			if(selectablesItems.length == 0) return;
			this.getMainWidget().setSelection([selectablesItems[itemNumber]]);
		},

		// IContainerComponent implementation

		add: function(childComponent, display) {
			var radioButton = childComponent.getMainWidget();
			if(!qx.Class.hasInterface(radioButton.constructor, qx.ui.form.IRadioItem))
				throw new Error("<radio-button-group> supports only components with main widgets implementing IRadioItem");
			this.getMainWidget().add(radioButton);
		},

		listChildren: function() {
			return this.getMainWidget().getChildren().map(function(widget) {
				return widget.getUserData("qookeryComponent");
			});
		},

		remove: function(component) {
			// TODO RadioButtonGroup: Implement removal of children
		},

		contains: function(component) {
			// TODO RadioButtonGroup: Implement contains()
		},

		// Internals

		_updateUI: function(value) {
			if(!value) {
				this.getMainWidget().resetSelection();
				return;
			}
			var radioButtonGroup = this.getMainWidget();
			var selectionFound = false;
			var buttons = radioButtonGroup.getChildren();
			for(var i = 0; i < buttons.length; i++) {
				var button = buttons[i];
				var model = button.getModel();
				if(!qookery.contexts.Model.areEqual(model, value)) {
					button.setFocusable(false);
				}
				else {
					button.setFocusable(true);
					radioButtonGroup.setSelection([ button ]);
					selectionFound = true;
				}
			}
			if(selectionFound) return;
			radioButtonGroup.resetSelection();
			if(buttons.length > 0) buttons[0].setFocusable(true);
		},

		__addGroupItem: function(model, label) {
			var groupItem = new qx.ui.form.RadioButton(label);
			groupItem.setModel(model);
			groupItem.setFocusable(false);
			var tabIndex = this.getAttribute("tab-index");
			if(tabIndex)
				groupItem.setTabIndex(tabIndex);
			this.getMainWidget().add(groupItem);
		},

		__removeAllGroupItems: function() {
			this.getMainWidget().removeAll();
		}
	}
});
