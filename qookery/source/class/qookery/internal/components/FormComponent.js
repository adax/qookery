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

	$Id$
*/

/**
 * Form components are the topmost components in a Qookery form's component hierarchy,
 *
 * They are responsible, among others, for managing children components, maintaining bindings,
 * handling data validation and providing scripting contexts to event handlers.
 */
qx.Class.define("qookery.internal.components.FormComponent", {

	extend: qookery.internal.components.CompositeComponent,
	implement: [ qookery.IFormComponent ],

	construct: function(parentComponent) {
		this.base(arguments, parentComponent);
		this.__controller = new qx.data.controller.Object();
		this.__validationManager = new qookery.internal.ValidatorManager();
		this.__componentMap = { };
	},

	events: {
		"openForm": "qx.event.type.Event",
		"closeForm": "qx.event.type.Event",
		"changeModel": "qx.event.type.Event"
	},

	members: {

		__controller: null,
		__componentMap: null,
		__validationManager: null,
		__clientCodeContext: null,
		__translationPrefix: null,
		__result: null,

		create: function(createOptions) {
			this.__translationPrefix = createOptions['translation-prefix'];
			this.base(arguments, createOptions);
		},

		getModel: function() {
			return this.__controller.getModel();
		},

		setModel: function(model) {
			qx.log.Logger.debug(this, "Setting model");
			this.__controller.setModel(model);
			this.fireEvent("changeModel", qx.event.type.Event, null);
		},

		getController: function() {
			return this.__controller;
		},

		getComponent: function(componentId) {
			return this.__componentMap[componentId];
		},

		registerComponent: function(component, id) {
			this.__componentMap[id] = component;
		},

		registerUserContext: function(key, userContext) {
			var clientCodeContext = this.getClientCodeContext();
			clientCodeContext[key] = userContext;
		},

		getForm: function() {
			return this;
		},

		addEventHandler: function(eventName, clientCode) {
			switch(eventName) {
			case "changeValid":
				this.__validationManager.addListener(eventName, function(event) { this.executeClientCode(clientCode, { "event": event }); }, this);
				return;
			case "openForm":
			case "closeForm":
			case "changeModel":
				this.addListener(eventName, function(event) { this.executeClientCode(clientCode, { "event": event }); }, this);
				return;
			}
			this.base(arguments, eventName, clientCode);
		},

		getValidationManager: function() {
			return this.__validationManager;
		},

		validate: function() {
			return this.__validationManager.validate();
		},

		clearValidations: function() {
			var items = this.getValidationManager().getItems();
			if(items == null) return;
			for(var item in items) {
				this.getValidationManager().remove(item);
			}
		},

		dispose: function() {
			this.fireEvent("closeForm", qx.event.type.Event, null);
			this.base(arguments);
		},

		/**
		 * Disposes the form.
		 *
		 * @param {} result The exit value of the component
		 */
		close: function(result) {
			if(result) this.__result = result;
			this.dispose();
		},

		getTranslationPrefix: function() {
			return this.__translationPrefix;
		},

		getResult: function() {
			return this.__result;
		},

		/**
		 * Generate a JavaScript context to be used by Qookery client code
		 *
		 * @return {Object} a suitable JavaScript context
		 */
		getClientCodeContext: function() {
			if(this.__clientCodeContext != null) return this.__clientCodeContext;
			var form = this;
			var context = function(selector) {
				if(!selector)
					throw new Error("$() without a selector is not supported");
				if(selector.charAt(0) == '#')
					return form.getComponent(selector.substr(1));
				return null;
			};
			context.form = this;
			return this.__clientCodeContext = context;
		}
	},

	destruct: function() {
		this.__controller.removeAllBindings();
		this._disposeObjects("__validationManager", "__controller", "__validationManager");
		this.__componentMap = null;
		this.__userContextMap = null;
		this.__registration = null;
		this.__clientCodeContext = null;
		this.__translationPrefix = null;
	}
});
