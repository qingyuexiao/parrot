(function(context, $, $pt) {
	var NSelectTree = React.createClass($pt.defineCellComponent({
		statics: {
		},
		propTypes: {
			// model
			model: React.PropTypes.object,
			// CellLayout
			layout: React.PropTypes.object
		},
		getDefaultProps: function() {
			return {
				defaultOptions: {
				},
				treeLayout: {
					comp: {
						root: false,
						check: true,
						multiple: true,
						hierarchyCheck: false
					}
				}
			};
		},
		getInitialState: function() {
			return {};
		},
		/**
		 * will update
		 * @param nextProps
		 */
		componentWillUpdate: function (nextProps) {
			// remove post change listener to handle model change
			this.removePostChangeListener(this.__forceUpdate);
			this.removeEnableDependencyMonitor();
			if (this.hasParent()) {
				// add post change listener into parent model
				this.getParentModel().removeListener(this.getParentPropertyId(), "post", "change", this.onParentModelChanged);
			}
			this.unregisterFromComponentCentral();
		},
		/**
		 * did update
		 * @param prevProps
		 * @param prevState
		 */
		componentDidUpdate: function (prevProps, prevState) {
			// add post change listener to handle model change
			this.addPostChangeListener(this.__forceUpdate);
			this.addEnableDependencyMonitor();
			if (this.hasParent()) {
				// add post change listener into parent model
				this.getParentModel().addListener(this.getParentPropertyId(), "post", "change", this.onParentModelChanged);
			}
			this.registerToComponentCentral();

			if (this.state.popoverDiv && this.state.popoverDiv.is(':visible')) {
				this.showPopover();
			}
		},
		/**
		 * did mount
		 */
		componentDidMount: function () {
			// add post change listener to handle model change
			this.addPostChangeListener(this.__forceUpdate);
			this.addEnableDependencyMonitor();
			if (this.hasParent()) {
				// add post change listener into parent model
				this.getParentModel().addListener(this.getParentPropertyId(), "post", "change", this.onParentModelChanged);
			}
			this.registerToComponentCentral();
		},
		/**
		 * will unmount
		 */
		componentWillUnmount: function () {
			this.destroyPopover();
			// remove post change listener to handle model change
			this.removePostChangeListener(this.__forceUpdate);
			this.removeEnableDependencyMonitor();
			if (this.hasParent()) {
				// add post change listener into parent model
				this.getParentModel().removeListener(this.getParentPropertyId(), "post", "change", this.onParentModelChanged);
			}
			this.unregisterFromComponentCentral();
		},
		renderTree: function() {
			var layout = $pt.createCellLayout('values', this.getTreeLayout());
			var model = $pt.createModel({values: this.getValueFromModel()});
			model.addPostChangeListener('values', this.onTreeValueChanged);
			return <NTree model={model} layout={layout}/>;
		},
		renderSelectionItem: function(codeItem, nodeId) {
			return (<li>
				<span className='fa fa-fw fa-remove' onClick={this.onSelectionItemRemove.bind(this, nodeId)}></span>
				{codeItem.text}
			</li>);
		},
		renderSelection: function() {
			var values = this.getValueFromModel();
			var codes = null;
			var _this = this;
			if (values == null) {
				return null;
			} else if (this.getTreeLayout().comp.valueAsArray) {
				// value as an array
				codes = this.getAvailableTreeModel().listAllChildren();
				return Object.keys(codes).map(function(id) {
					var value = values.find(function(value) {
						return value == id;
					});
					if (value != null) {
						return _this.renderSelectionItem(codes[value], value);
					}
				});
			} else {
				// value as a hierarchy json object
				codes = this.getAvailableTreeModel().listWithHierarchyKeys({separator: NTree.NODE_SEPARATOR, rootId: NTree.ROOT_ID});
				var render = function(node, currentId, parentId) {
					var nodeId = parentId + NTree.NODE_SEPARATOR + currentId;
					var spans = [];
					if (node.selected) {
						spans.push(_this.renderSelectionItem(codes[nodeId], nodeId));
					}
					spans.push.apply(spans, Object.keys(node).filter(function(key) {
						return key != 'selected';
					}).map(function(key) {
						return render(node[key], key, nodeId);
					}));
					return spans;
				};
				return Object.keys(values).filter(function(key) {
					return key != 'selected';
				}).map(function(key) {
					return render(values[key], key, NTree.ROOT_ID);
				});
			}
		},
		renderText: function() {
			return (<div className='input-group form-control' onClick={this.onComponentClicked} ref='comp'>
				<ul className='selection'>
					{this.renderSelection()}
				</ul>
				<span className='fa fa-fw fa-sort-down pull-right' />
			</div>);
		},
		render: function() {
			var css = {
				'n-disabled': !this.isEnabled()
			};
			css[this.getComponentCSS('n-select-tree')] = true;
			return (<div className={$pt.LayoutHelper.classSet(css)} tabIndex='0'>
				{this.renderText()}
				{this.renderNormalLine()}
				{this.renderFocusLine()}
			</div>);
		},
		renderPopoverContainer: function() {
			if (this.state.popoverDiv == null) {
				this.state.popoverDiv = $('<div>');
				this.state.popoverDiv.appendTo($('body'));
				$(document).on('click', this.onDocumentClicked).on('keyup', this.onDocumentKeyUp);
			}
			this.state.popoverDiv.hide();
		},
		renderPopover: function() {
			var styles = {display: 'block'};
			var component = this.getComponent();
			styles.width = component.outerWidth();
			var offset = component.offset();
			styles.top = offset.top + component.outerHeight();
			styles.left = offset.left;
			var popover = (<div role="tooltip" className="n-select-tree-popover popover bottom in" style={styles}>
				<div className="arrow" style={{left: '20px'}}></div>
				<div className="popover-content">
					{this.renderTree()}
				</div>
			</div>);
			React.render(popover, this.state.popoverDiv.get(0));
		},
		showPopover: function() {
			this.renderPopoverContainer();
			this.renderPopover();
			this.state.popoverDiv.show();
		},
		hidePopover: function() {
			if (this.state.popoverDiv && this.state.popoverDiv.is(':visible')) {
				this.state.popoverDiv.hide();
				React.render(<noscript/>, this.state.popoverDiv.get(0));
			}
		},
		destroyPopover: function() {
			if (this.state.popoverDiv) {
				$(document).off('click', this.onDocumentClicked).off('keyup', this.onDocumentKeyUp);
				this.state.popoverDiv.remove();
				delete this.state.popoverDiv;
			}
		},
		onComponentClicked: function() {
			if (!this.isEnabled()) {
				// do nothing
				return;
			}
			this.showPopover();
		},
		onDocumentClicked: function(evt) {
			var target = $(evt.target);
			if (target.closest(this.getComponent()).length == 0 && target.closest(this.state.popoverDiv).length == 0) {
				this.hidePopover();
			}
		},
		onDocumentKeyUp: function(evt) {
			if (evt.keyCode === 27) {
				this.hidePopover();
			}
		},
		/**
		 * on parent model changed
		 */
		onParentModelChanged: function() {
			var parentChanged = this.getComponentOption('parentChanged');
			if (parentChanged) {
				this.setValueToModel(parentChanged.call(this, this.getModel(), this.getParentPropertyValue()));
			} else {
				// clear values
				this.setValueToModel(null);
			}
			this.forceUpdate();
		},
		/**
		 * on tree value changed
		 */
		onTreeValueChanged: function(evt) {
			var values = evt.new;
			if (values == null) {
				this.setValueToModel(values);
			} else if (Array.isArray(values)) {
				this.setValueToModel(values.slice(0));
			} else {
				this.setValueToModel($.extend(true, {}, values));
			}
		},
		onSelectionItemRemove: function(nodeId) {
			if (!this.isEnabled()) {
				// do nothing
				return;
			}
			var values = this.getValueFromModel();
			var hierarchyCheck = this.getTreeLayout().comp.hierarchyCheck;
			if (values == null) {
				// do nothing
			} else if (this.getTreeLayout().comp.valueAsArray) {
				if (hierarchyCheck) {
					var codes = this.getAvailableTreeModel().listWithHierarchyKeys({separator: NTree.NODE_SEPARATOR, rootId: NTree.ROOT_ID});
					var codeHierarchyIds = Object.keys(codes);
					// find all children
					var childrenIds = codeHierarchyIds.filter(function(key) {
						return key.indexOf(nodeId + NTree.NODE_SEPARATOR) != -1;
					}).map(function(id) {
						return id.split(NTree.NODE_SEPARATOR).pop();
					});
					var hierarchyId = codeHierarchyIds.find(function(id) {
						return id.endsWith(NTree.NODE_SEPARATOR + nodeId);
					});
					// find itself and its ancestor ids
					var ancestorIds = codeHierarchyIds.filter(function(id) {
						return hierarchyId.startsWith(id);
					}).map(function(id) {
						return id.split(NTree.NODE_SEPARATOR).pop();
					});
					// combine
					var ids = childrenIds.concat(ancestorIds);
					// filter found ids
					this.setValueToModel(values.filter(function(id) {
						return -1 == ids.findIndex(function(idNeedRemove) {
							return id == idNeedRemove;
						});
					}));
				} else {
					// remove itself
					this.setValueToModel(values.filter(function(id) {
						return id != nodeId;
					}));
				}
			} else {
				var effectiveNodes = nodeId.split(NTree.NODE_SEPARATOR).slice(1);
				var node = $pt.getValueFromJSON(values, effectiveNodes.join($pt.PROPERTY_SEPARATOR));
				if (hierarchyCheck) {
					// set itself and its children to unselected
					Object.keys(node).forEach(function(key) {
						delete node[key];
					});
					// set its ancestors to unselected
					effectiveNodes.splice(effectiveNodes.length - 1, 1);
					effectiveNodes.forEach(function(id, index, array) {
						$pt.setValueIntoJSON(values, array.slice(0, index + 1).join($pt.PROPERTY_SEPARATOR) + $pt.PROPERTY_SEPARATOR + 'selected', false);
					});
				} else {
					// set itself to unselected
					delete node.selected;
				}
				this.getModel().firePostChangeEvent(this.getDataId(), values, values);
			}
		},
		getComponent: function() {
			return $(React.findDOMNode(this.refs.comp));
		},
		/**
		 * get tree model
		 * @returns {CodeTable}
		 */
		getTreeModel: function() {
			return this.getComponentOption('data');
		},
		/**
		 * get available tree model
		 * @returns {CodeTable}
		 */
		getAvailableTreeModel: function() {
			var filter = this.getComponentOption('parentFilter');
			var tree = this.getTreeModel();
			if (filter) {
				return filter.call(this, tree, this.getParentPropertyValue());
			} else {
				return tree;
			}
		},
		getTreeLayout: function() {
			var treeLayout = this.getComponentOption('treeLayout');
			if (treeLayout) {
				treeLayout = $.extend(true, {}, this.props.treeLayout, treeLayout);
			} else {
				treeLayout = $.extend(true, {}, this.props.treeLayout);
			}
			treeLayout.comp.data = this.getAvailableTreeModel();
			treeLayout.comp.valueAsArray = treeLayout.comp.valueAsArray ? treeLayout.comp.valueAsArray : false;
			return treeLayout;
		},
		/**
		 * has parent or not
		 * @returns {boolean}
		 */
		hasParent: function() {
			return this.getParentPropertyId() != null;
		},
		/**
		 * get parent property id
		 * @returns {string}
		 */
		getParentPropertyId: function() {
			return this.getComponentOption("parentPropId");
		},
		/**
		 * get parent model
		 * @returns {ModelInterface}
		 */
		getParentModel: function () {
			var parentModel = this.getComponentOption("parentModel");
			return parentModel == null ? this.getModel() : parentModel;
		},
		/**
		 * get parent property value
		 * @returns {*}
		 */
		getParentPropertyValue: function () {
			return this.getParentModel().get(this.getParentPropertyId());
		}
	}));
	context.NSelectTree = NSelectTree;
}(this, jQuery, $pt));