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

qx.Class.define("qookery.richtext.internal.RichTextWidget", {

	extend: qx.ui.core.Widget,

	construct: function(attributes) {
		this.base(arguments);
		this.setAppearance("textfield");
		this.setFocusable(true);
		if(attributes["tab-index"] !== undefined) this.setTabIndex(attributes["tab-index"]);
		this.addListener("roll", function(event) {
			if(event.getPointerType() != "wheel") return;
			var contentElement = this.getContentElement();
			var scrollY = contentElement.getScrollY();
			contentElement.scrollToY(scrollY + (event.getDelta().y / 30) * 20);
			event.stop();
		}, this);
	},

	members: {

		_createContentElement: function() {
			// Create a selectable and overflow enabled <div>
			var element = new qx.html.Element("div", {
				overflowX: "auto",
				overflowY: "auto"
			});
			element.setSelectable(true);
			return element;
		}
	}
});
