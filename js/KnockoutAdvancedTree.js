function TreeViewModel(options) {
	var defaults = {
		hierSeparator: "|",
		nodeDataIdPropertyName: "Id",
		nodeDataParentIdPropertyName: "ParentId",
		nodeDataDisplayNamePropertyName: "Name",
		startExpanded: true,
		searchTextWithTrimming: false,
		searchTextCaseSensitive: false,
		searchTextMatchWhole: true,
		searchTextIsRegularExpression: false,
		nodeDataPropertiesArray: [],
		sortByPropertyName: "Name",
		sortByIsAscending: true,
		slicingDelayInMilliSeconds: 2,
		slicingBulkSize: 500,
		topRootNodeName: "Root"
	};
	
	var settings = $.extend({}, defaults, options);

	var self = this;
	
	self.SlicingDelayInMilliSeconds = settings.slicingDelayInMilliSeconds;
	self.SlicingBulkSize = settings.slicingBulkSize;
	self.HierSeparator = settings.hierSeparator;
	self.NodeDataIdPropertyName = settings.nodeDataIdPropertyName;
	self.NodeDataParentIdPropertyName = settings.nodeDataParentIdPropertyName;
	self.NodeDataDisplayNamePropertyName = settings.nodeDataDisplayNamePropertyName;
	self.StartExpanded = settings.startExpanded;
	self.TopRootNodeName = settings.topRootNodeName;
	
	self.SearchTextHighlightIsOn = ko.observable(false);
	self.SearchText = ko.observable("");
	self.SearchTextRegularExpressionOptions = ko.observable("");
	self.SearchTextWithTrimming = ko.observable(settings.searchTextWithTrimming);
	self.SearchTextCaseSensitive = ko.observable(settings.searchTextCaseSensitive);
	self.SearchTextMatchWhole = ko.observable(settings.searchTextMatchWhole);
	self.NodeDataPropertiesArray = ko.observableArray(settings.nodeDataPropertiesArray);
	
	self.SearchTextOperationMode = ko.computed({
		read: function () {
			var searchTextIsRegularExpression = self.SearchTextIsRegularExpression();
			var result;
			
			if(searchTextIsRegularExpression) {
				result = "reg";
			}
			else {
				result = "notReg";
			}
			
			return result;
		},
		write: function (value) {
			switch(value) {
				case "reg":
					self.SearchTextIsRegularExpression(true);
					break;
				case "notReg":
					self.SearchTextIsRegularExpression(false);
					break;
			}
		},
		deferEvaluation: true
	});
	
	self.private_SearchTextIsRegularExpression = ko.observable(settings.searchTextIsRegularExpression);
	self.SearchTextIsRegularExpression = ko.computed({
		read: function () {
			return self.private_SearchTextIsRegularExpression(); 
		},
		write: function (value) {
			self.private_SearchTextIsRegularExpression(value);
			
			if(value) {
				
			}
		},
		deferEvaluation: true
	});
	
	self.private_SearchTextPropertyName = ko.observable("");
	self.SearchTextPropertyName = ko.computed({
		read: function () {
			var val = self.private_SearchTextPropertyName();
			
			if(typeof(val) == "undefined" || null == val || '' == val) {
				if(typeof(self.NodeDataPropertiesArray) != 'undefined' && null != self.NodeDataPropertiesArray && self.NodeDataPropertiesArray().length > 0) {
					val = self.NodeDataPropertiesArray()[0].value;
				}
			}
			
			return val;
		},
		write: function (value) {
			self.private_SearchTextPropertyName(value);
		},
		deferEvaluation: true
	});
	
	self.private_SortByPropertyName = ko.observable(settings.sortByPropertyName);
	self.private_SortByProperty = ko.observable();
	self.SortByProperty = ko.computed({
		read: function () {
			var val = self.private_SortByProperty();
			
			if(typeof(val) == "undefined" || null == val) {
				if(typeof(self.NodeDataPropertiesArray) != 'undefined' && null != self.NodeDataPropertiesArray && self.NodeDataPropertiesArray().length > 0) {
					var settingVal = self.private_SortByPropertyName();
					
					if(typeof(settingVal) != "undefined" && null != settingVal && '' != settingVal) {
						var val = self.NodeDataPropertiesArray().firstOrDefault(function(property){
							return (property.name == settingVal);
						}, null);
					}
					
					if(typeof(val) == "undefined" || null == val) {
						val = self.NodeDataPropertiesArray()[0];
					}
				}
			}
			
			return val;
		},
		write: function (value) {
			self.private_SortByProperty(value);
		},
		deferEvaluation: true
	});
	
	self.BooleanSortByDirectionIsAscending = ko.observable(settings.sortByIsAscending);
	self.SortByDirectionIsAscending = ko.computed({
		read: function () {
			var result = "true";
			
			if(self.BooleanSortByDirectionIsAscending() != true) {
				result = "false";
			}
			
			return result;
		},
		write: function (value) {
			var result = true;
			
			if(value == "false") {
				result = false;
			}
			
			self.BooleanSortByDirectionIsAscending(result);
		},
		deferEvaluation: true
	});
	
	self.FlatTreeNodesArray = ko.observableArray([]);
	
	self.NestedTreeNodesArray = ko.observableArray([]);
	
	self.TotalNumberOfNodes = ko.computed({
		read: function () {
			var result = ko.observable(0);
	
			if(typeof(self.FlatTreeNodesArray) != 'undefined' && null != self.FlatTreeNodesArray && self.FlatTreeNodesArray().length > 0) {
				result = self.FlatTreeNodesArray().length;
			}
			
			return result;
		},
		deferEvaluation: true
	});
	
	self.FirstSelectedNode = ko.computed({
		read: function () {
			var result = ko.observable();
	
			if(typeof(self.FlatTreeNodesArray) != 'undefined' && null != self.FlatTreeNodesArray && self.FlatTreeNodesArray().length > 0) {
				var firstSelected = self.FlatTreeNodesArray().firstOrDefault(function(node){
					return (node.IsSelected() == true);
				});
				
				if(typeof(firstSelected) != 'undefined' && null != firstSelected) {
					result = firstSelected;
				}
			}
			
			return result;
		},
		deferEvaluation: true
	});
	
	self.SelectedNodes = ko.computed({
		read: function () {
			var result = ko.observableArray([]);
			
			if(typeof(self.FlatTreeNodesArray) != 'undefined' && null != self.FlatTreeNodesArray && self.FlatTreeNodesArray().length > 0) {
				result = self.FlatTreeNodesArray().where(function(node){
					return (node.IsSelected() == true);
				}, false);
			}
			
			return result;
		},
		deferEvaluation: true
	});
	
	self.ExpandAll = function() {
		self.ToggleNodesExpandStateByDelegate(true, function(node){
			return (node.IsExpanded() == false);
		}, false);
	};
	self.CollapseAll = function() {
		self.ToggleNodesExpandStateByDelegate(false, function(node){
			return (node.IsExpanded() == true);
		}, false);
	};
	self.ExpandNodeById = function(nodeId, isRegularExpression, regularExpressionOptions, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains) {
		self.ExpandNodesByPropertyName(self.NodeDataIdPropertyName, nodeId, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, true);
	};
	self.CollapseNodeById = function(nodeId, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains) {
		self.CollapseNodesByPropertyName(self.NodeDataIdPropertyName, nodeId, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, true);
	};
	self.ExpandNodeByFullName = function(nodeFullName, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains) {
		var matchingNode = self.GetTreeNodeByFullName(nodeFullName, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains);
		
		if(typeof(matchingNode) != 'undefined' && null != matchingNode) {
			ToggleNodeExpandState(matchingNode, true);
		}
	};
	self.CollapseNodeByFullName = function(nodeFullName, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains) {
		var matchingNode = self.GetTreeNodeByFullName(nodeFullName, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains);
		
		if(typeof(matchingNode) != 'undefined' && null != matchingNode) {
			ToggleNodeExpandState(matchingNode, false);
		}
	};
	self.ExpandNodesByParentId = function(nodeParentId, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains) {
		self.ExpandNodesByPropertyName(self.NodeDataParentIdPropertyName, nodeParentId, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, false);
	};
	self.CollapseNodesByParentId = function(nodeParentId, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains) {
		self.CollapseNodesByPropertyName(self.NodeDataParentIdPropertyName, nodeParentId, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, false);
	};
	self.ExpandNodesByDisplayName = function(nodeDisplayName, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains) {
		self.ExpandNodesByPropertyName(self.NodeDataParentIdPropertyName, nodeDisplayName, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, false);
	};
	self.CollapseNodesByDisplayName = function(nodeDisplayName, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains) {
		self.CollapseNodesByPropertyName(self.NodeDataParentIdPropertyName, nodeDisplayName, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, false);
	};
	self.ExpandNodesByPropertyName = function(propertyName, propertyValue, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, firstOnly) {
		self.ToggleNodesExpandStateByPropertyName(true, propertyName, propertyValue, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, firstOnly);
	};
	self.CollapseNodesByPropertyName = function(propertyName, propertyValue, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, firstOnly) {
		self.ToggleNodesExpandStateByPropertyName(false, propertyName, propertyValue, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, firstOnly);
	};
	self.ExpandNodesByDelegate = function(delegate, firstOnly) {
		self.ToggleNodesExpandStateByDelegate(true, delegate, firstOnly);
	};
	self.CollapseNodesByDelegate = function(delegate, firstOnly) {
		self.ToggleNodesExpandStateByDelegate(false, delegate, firstOnly);
	};
	self.Expand = function(node) {
		if(typeof(node) != 'undefined' && null != node) {
			ToggleNodeExpandState(node, true);
		}
	};
	self.Collapse = function(node) {
		if(typeof(node) != 'undefined' && null != node) {
			ToggleNodeExpandState(node, false);
		}
	};
	self.ReverseExpandCollapseState = function(node) {
		if(typeof(node) != 'undefined' && null != node) {
			ToggleNodeExpandState(node, !node.IsExpanded());
		}
	};
	self.ToggleNodesExpandStateByPropertyName = function(expand, propertyName, propertyValue, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, firstOnly) {
		var matchingNodes = self.GetTreeNodesByPropertyName(propertyName, propertyValue, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, firstOnly);
		
		if(typeof(matchingNodes) != 'undefined' && null != matchingNodes && matchingNodes().length > 0) {
			ApplyActionOnBulks(matchingNodes(), function(item){
				ToggleNodeExpandState(item, expand);
			}, self.SlicingBulkSize, self.SlicingDelayInMilliSeconds);
		}
	};
	self.ToggleNodesExpandStateByDelegate = function(expand, delegate, firstOnly) {
		if(typeof(delegate) != 'undefined' && null != delegate) {
			var matchingNodes = self.GetTreeNodesByDelegate(delegate, firstOnly);
			
			if(typeof(matchingNodes) != 'undefined' && null != matchingNodes && matchingNodes().length > 0) {
				ApplyActionOnBulks(matchingNodes(), function(item){
					ToggleNodeExpandState(item, expand);
				}, self.SlicingBulkSize, self.SlicingDelayInMilliSeconds);
			}
		}
	};
	self.ExpandToNodeById = function(nodeId, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains) {
		self.ExpandToNodesByPropertyName(self.NodeDataIdPropertyName, nodeId, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, true);
	};	
	self.ExpandToNodesByFullName = function(nodeFullName, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains) {
		self.ExpandToNodesByDelegate(function(node){
			var result = false;
			var regex;
		
			try {
				regex = new RegExp(nodeFullName, regularExpressionOptions);
			}
			catch(ex) {
				isRegularExpression = false;
			}
			
			if(typeof(node) != 'undefined' && null != node && null != nodeFullName) {
				var compareToValue = node.FullName();
				
				if(isRegularExpression) {
					var matches = regex.exec(compareToValue);
					result = (typeof(matches) != "undefined" && null != matches && "" != matches.join("-"));
				}
				else {
					if(withTrimming) {
						nodeFullName = nodeFullName.toString().trim();
					}
					
					if(!caseSensitive) {
						nodeFullName = nodeFullName.toString().toLowerCase();
					}
					
					if(typeof(compareToValue) != 'undefined' && null != compareToValue) {
						if(withTrimming) {
							compareToValue = compareToValue.toString().trim();
						}
						
						if(!caseSensitive) {
							compareToValue = compareToValue.toString().toLowerCase();
						}
					}
					
					if(contains) {
						result = (compareToValue.indexOf(nodeFullName) != -1);
					}
					else {
						result = (nodeFullName == compareToValue);
					}
				}
			}
			
			return result;
		}, false);
	};
	self.ExpandToNodesByParentId = function(nodeParentId, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains) {
		self.ExpandToNodesByPropertyName(self.NodeDataParentIdPropertyName, nodeParentId, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, false);
	};
	self.ExpandToNodesByDisplayName = function(nodeDisplayName, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains) {
		self.ExpandToNodesByPropertyName(self.NodeDataDisplayNamePropertyName, nodeDisplayName, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, false);
	};
	self.ExpandToNodesByPropertyName = function(propertyName, propertyValue, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, firstOnly) {
		self.ExpandToNodesByDelegate(function(node){
			var result = false;
			var regex;
		
			try {
				regex = new RegExp(propertyValue, regularExpressionOptions);
			}
			catch(ex) {
				isRegularExpression = false;
			}
			
			if(typeof(node) != 'undefined' && null != node && typeof(node.NodeData) != 'undefined' && null != node.NodeData && null != propertyValue) {
				var compareToValue = node.NodeData()[propertyName]();
				
				if(isRegularExpression) {
					var matches = regex.exec(compareToValue);
					result = (typeof(matches) != "undefined" && null != matches && "" != matches.join("-"));
				}
				else {
					if(withTrimming) {
						propertyValue = propertyValue.toString().trim();
					}
					
					if(!caseSensitive) {
						propertyValue = propertyValue.toString().toLowerCase();
					}
					
					if(typeof(compareToValue) != 'undefined' && null != compareToValue) {
						if(withTrimming) {
							compareToValue = compareToValue.toString().trim();
						}
						
						if(!caseSensitive) {
							compareToValue = compareToValue.toString().toLowerCase();
						}
					}
					
					if(contains) {
						result = (compareToValue.indexOf(propertyValue) != -1);
					}
					else {
						result = (propertyValue == compareToValue);
					}
				}
			}
			
			return result;
		}, firstOnly);
	};	
	self.ExpandToNodesByDelegate = function(delegate, firstOnly) {
		if(typeof(delegate) != 'undefined' && null != delegate) {
			if(typeof(self.FlatTreeNodesArray) != 'undefined' && null != self.FlatTreeNodesArray && self.FlatTreeNodesArray().length > 0) {
				var matchingNodes = self.GetTreeNodesByDelegate(delegate, firstOnly);
				
				if(typeof(matchingNodes) != 'undefined' && null != matchingNodes && (firstOnly || matchingNodes().length > 0)) {
					var allMatchingNode = ko.observableArray([]);
					
					if(firstOnly) {
						allMatchingNode.push(matchingNodes);
					}
					else {
						allMatchingNode = matchingNodes;
					}
					
					var nodesToHighlight = new Array();
					var paths = new Array();
					
					for(var i = 0; i < allMatchingNode().length; i++) {
						paths.push(allMatchingNode()[i].FullPath());
						nodesToHighlight.push(allMatchingNode()[i].Id());
					}
					
					var normalizedPaths = new Array();
					
					for(var i = 0; i < paths.length; i++) {
						var longestPath = paths[i];
						for(var k = 0; k < paths.length; k++) {
							if(paths[k].length > longestPath.length) {
								if(paths[k].substring(0, longestPath.length) == longestPath) {
									longestPath = paths[k];
								}
							}
						}
						
						normalizedPaths.push(longestPath);
					}
					
					normalizedPaths = normalizedPaths.distinct();
					
					var nodesToExpand = new Array();
					for(var i = 0; i < normalizedPaths.length; i++) {
						var pathArray = normalizedPaths[i].split(self.HierSeparator);
						
						if(pathArray.length > 1) {
							for(var k = 0; k < pathArray.length - 1; k++) {
								nodesToExpand.push(pathArray[k]);
							}
						}
					}
					
					nodesToExpand = nodesToExpand.distinct();
					
					if(typeof(nodesToExpand) != 'undefined' && null != nodesToExpand && nodesToExpand.length > 0) {
						ApplyActionOnBulks(nodesToExpand, function(item){
							var node = self.GetTreeNodeById(item, false, "", false, false, false);
							ToggleNodeExpandState(node, true);
						}, self.SlicingBulkSize, self.SlicingDelayInMilliSeconds);
					}
						
					if(typeof(nodesToHighlight) != 'undefined' && null != nodesToHighlight && nodesToHighlight.length > 0) {
						ApplyActionOnBulks(nodesToHighlight, function(item){
							var node = self.GetTreeNodeById(item, false, "", false, false, false);
							ToggleNodeHighlightState(node, true);
						}, self.SlicingBulkSize, self.SlicingDelayInMilliSeconds);
					}
				}
			}
		}
	};
	
	function ToggleNodeExpandState(node, expand) {
		if(typeof(node) != 'undefined' && null != node) {
			node.IsExpanded(expand);
		}
	};
	
	self.SelectAll = function() {
		self.ToggleNodesSelectStateByDelegate(true, function(node){
			return (node.IsSelected() == false);
		}, false);
	};
	self.DeselectAll = function() {
		self.ToggleNodesSelectStateByDelegate(false, function(node){
			return (node.IsSelected() == true);
		}, false);
	};
	self.SelectNodeById = function(nodeId, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains) {
		self.SelectNodesByPropertyName(self.NodeDataIdPropertyName, nodeId, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, true);
	};
	self.DeselectNodeById = function(nodeId, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains) {
		self.DeselectNodeByPropertyName(self.NodeDataIdPropertyName, nodeId, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, true);
	};
	self.SelectNodeByFullName = function(nodeFullName, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains) {
		var matchingNode = self.GetTreeNodeByFullName(nodeFullName, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains);
		
		if(typeof(matchingNode) != 'undefined' && null != matchingNode) {
			ToggleNodeSelectState(matchingNode, true);
		}
	};
	self.DeselectNodeByFullName = function(nodeFullName, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains) {
		var matchingNode = self.GetTreeNodeByFullName(nodeFullName, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains);
		
		if(typeof(matchingNode) != 'undefined' && null != matchingNode) {
			ToggleNodeSelectState(matchingNode, false);
		}
	};
	self.SelectNodesByParentId = function(nodeParentId, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains) {
		self.SelectNodesByPropertyName(self.NodeDataParentIdPropertyName, nodeParentId, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, false);
	};
	self.DeselectNodesByParentId = function(nodeParentId, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains) {
		self.DeselectNodesByPropertyName(self.NodeDataParentIdPropertyName, nodeParentId, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, false);
	};
	self.SelectNodesByDisplayName = function(nodeDisplayName, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains) {
		self.SelectNodesByPropertyName(self.NodeDataParentIdPropertyName, nodeDisplayName, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, false);
	};
	self.DeselectNodesByDisplayName = function(nodeDisplayName, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains) {
		self.DeselectNodesByPropertyName(self.NodeDataParentIdPropertyName, nodeDisplayName, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, false);
	};
	self.SelectNodesByPropertyName = function(propertyName, propertyValue, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, firstOnly) {
		self.ToggleNodesSelectStateByPropertyName(true, propertyName, propertyValue, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, firstOnly);
	};
	self.DeselectNodesByPropertyName = function(propertyName, propertyValue, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, firstOnly) {
		self.ToggleNodesSelectStateByPropertyName(false, propertyName, propertyValue, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, firstOnly);
	};
	self.SelectNodesByDelegate = function(delegate, firstOnly) {
		self.ToggleNodesSelectStateByDelegate(true, delegate, firstOnly);
	};
	self.DeselectNodesByDelegate = function(delegate, firstOnly) {
		self.ToggleNodesSelectStateByDelegate(false, delegate, firstOnly);
	};	
	self.Select = function(node) {
		if(typeof(node) != 'undefined' && null != node) {
			ToggleNodeSelectState(node, true);
		}
	};
	self.Deselect = function(node) {
		if(typeof(node) != 'undefined' && null != node) {
			ToggleNodeSelectState(node, false);
		}
	};
	self.ReverseSelectDeselectState = function(node) {
		if(typeof(node) != 'undefined' && null != node) {
			ToggleNodeSelectState(node, !node.IsSelected());
		}
	};
	self.ToggleNodesSelectStateByPropertyName = function(select, propertyName, propertyValue, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, firstOnly) {
		var matchingNodes = self.GetTreeNodesByPropertyName(propertyName, propertyValue, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, firstOnly);
		
		if(typeof(matchingNodes) != 'undefined' && null != matchingNodes && matchingNodes().length > 0) {
			if(typeof(matchingNodes) != 'undefined' && null != matchingNodes && matchingNodes().length > 0) {
				ApplyActionOnBulks(matchingNodes(), function(item){
					ToggleNodeSelectState(item, select);
				}, self.SlicingBulkSize, self.SlicingDelayInMilliSeconds);
			}
		}
	};	
	self.ToggleNodesSelectStateByDelegate = function(select, delegate, firstOnly) {
		if(typeof(delegate) != 'undefined' && null != delegate) {
			var matchingNodes = self.GetTreeNodesByDelegate(delegate, firstOnly);
			
			if(typeof(matchingNodes) != 'undefined' && null != matchingNodes && matchingNodes().length > 0) {
				if(typeof(matchingNodes) != 'undefined' && null != matchingNodes && matchingNodes().length > 0) {
					ApplyActionOnBulks(matchingNodes(), function(item){
						ToggleNodeSelectState(item, select);
					}, self.SlicingBulkSize, self.SlicingDelayInMilliSeconds);
				}
			}
		}
	};
	
	function ToggleNodeSelectState(node, select) {
		if(typeof(node) != 'undefined' && null != node) {
			node.IsSelected(select);
		}
	};
	
	self.HighlightAll = function() {
		self.ToggleNodesHighlightStateByDelegate(true, function(node){
			return (node.IsHighlighted() == false);
		}, false);
	};
	self.DehighlightAll = function() {
		self.ToggleNodesHighlightStateByDelegate(false, function(node){
			return (node.IsHighlighted() == true);
		}, false);
	};
	self.HighlightNodeById = function(nodeId, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains) {
		self.HighlightNodesByPropertyName(self.NodeDataIdPropertyName, nodeId, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, true);
	};
	self.DehighlightNodeById = function(nodeId, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains) {
		self.DehighlightNodeByPropertyName(self.NodeDataIdPropertyName, nodeId, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, true);
	};
	self.HighlightNodeByFullName = function(nodeFullName, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains) {
		var matchingNode = self.GetTreeNodeByFullName(nodeFullName, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains);
		
		if(typeof(matchingNode) != 'undefined' && null != matchingNode) {
			ToggleNodeHighlightState(matchingNode, true);
		}
	};
	self.DehighlightNodeByFullName = function(nodeFullName, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains) {
		var matchingNode = self.GetTreeNodeByFullName(nodeFullName, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains);
		
		if(typeof(matchingNode) != 'undefined' && null != matchingNode) {
			ToggleNodeHighlightState(matchingNode, false);
		}
	};
	self.HighlightNodesByParentId = function(nodeParentId, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains) {
		self.HighlightNodesByPropertyName(self.NodeDataParentIdPropertyName, nodeParentId, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, false);
	};
	self.DehighlightNodesByParentId = function(nodeParentId, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains) {
		self.DehighlightNodesByPropertyName(self.NodeDataParentIdPropertyName, nodeParentId, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, false);
	};
	self.HighlightNodesByDisplayName = function(nodeDisplayName, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains) {
		self.HighlightNodesByPropertyName(self.NodeDataParentIdPropertyName, nodeDisplayName, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, false);
	};
	self.DehighlightNodesByDisplayName = function(nodeDisplayName, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains) {
		self.DehighlightNodesByPropertyName(self.NodeDataParentIdPropertyName, nodeDisplayName, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, false);
	};
	self.HighlightNodesByPropertyName = function(propertyName, propertyValue, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, firstOnly) {
		self.ToggleNodesHighlightStateByPropertyName(true, propertyName, propertyValue, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, firstOnly);
	};
	self.DehighlightNodesByPropertyName = function(propertyName, propertyValue, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, firstOnly) {
		self.ToggleNodesHighlightStateByPropertyName(false, propertyName, propertyValue, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, firstOnly);
	};
	self.HighlightNodesByDelegate = function(delegate, firstOnly) {
		self.ToggleNodesHighlightStateByDelegate(true, delegate, firstOnly);
	};
	self.DehighlightNodesByDelegate = function(delegate, firstOnly) {
		self.ToggleNodesHighlightStateByDelegate(false, delegate, firstOnly);
	};	
	self.Highlight = function(node) {
		if(typeof(node) != 'undefined' && null != node) {
			ToggleNodeHighlightState(node, true);
		}
	};
	self.Dehighlight = function(node) {
		if(typeof(node) != 'undefined' && null != node) {
			ToggleNodeHighlightState(node, false);
		}
	};
	self.ReverseHighlightDehighlightState = function(node) {
		if(typeof(node) != 'undefined' && null != node) {
			ToggleNodeHighlightState(node, !node.IsHighlighted());
		}
	};
	self.ToggleNodesHighlightStateByPropertyName = function(highlight, propertyName, propertyValue, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, firstOnly) {
		var matchingNodes = self.GetTreeNodesByPropertyName(propertyName, propertyValue, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, firstOnly);
		
		if(typeof(matchingNodes) != 'undefined' && null != matchingNodes && matchingNodes().length > 0) {
			ApplyActionOnBulks(matchingNodes(), function(item){
				ToggleNodeHighlightState(item, highlight);
			}, self.SlicingBulkSize, self.SlicingDelayInMilliSeconds);
		}
	};	
	self.ToggleNodesHighlightStateByDelegate = function(highlight, delegate, firstOnly) {
		if(typeof(delegate) != 'undefined' && null != delegate) {
			var matchingNodes = self.GetTreeNodesByDelegate(delegate, firstOnly);
			
			if(typeof(matchingNodes) != 'undefined' && null != matchingNodes && matchingNodes().length > 0) {
				ApplyActionOnBulks(matchingNodes(), function(item){
					ToggleNodeHighlightState(item, highlight);
				}, self.SlicingBulkSize, self.SlicingDelayInMilliSeconds);
			}
		}
	};

	function ToggleNodeHighlightState(node, highlight) {
		if(typeof(node) != 'undefined' && null != node) {
			node.IsHighlighted(highlight);
		}
	};
	
	self.SortTreeById = function(isNumeric, withTrimming, caseSensitive, isAscending) {
		self.SortTreeByPropertyName(self.NodeDataIdPropertyName, isNumeric, withTrimming, caseSensitive, isAscending);
	};
	self.SortTreeByParentId = function(isNumeric, withTrimming, caseSensitive, isAscending) {
		self.SortTreeByPropertyName(self.NodeDataParentIdPropertyName, isNumeric, withTrimming, caseSensitive, isAscending);
	};
	self.SortTreeByDisplayName = function(isNumeric, withTrimming, caseSensitive, isAscending) {
		self.SortTreeByPropertyName(self.NodeDataDisplayNamePropertyName, isNumeric, withTrimming, caseSensitive, isAscending);
	};
	self.SortTreeByPropertyName = function(propertyName, isNumeric, withTrimming, caseSensitive, isAscending) {
		if(typeof(self.FlatTreeNodesArray) != 'undefined' && null != self.FlatTreeNodesArray && self.FlatTreeNodesArray().length > 0) {
			function SortItemsByPropertyNameComparer(a, b) {
				var result = 0;
				
				var valA = a.NodeData()[propertyName]();
				
				if(null != valA) {
					if(withTrimming) {
						valA = valA.toString().trim();
					}
					
					if(!caseSensitive) {
						valA = valA.toString().toLowerCase();
					}
				}
				
				var valB = b.NodeData()[propertyName]();
				
				if(null != valB) {
					if(withTrimming) {
						valB = valB.toString().trim();
					}
					
					if(!caseSensitive) {
						valB = valB.toString().toLowerCase();
					}
				}
				
				if (isNumeric) {
					if(isNaN(parseFloat(valA))) {
						valA = -1;
					}
					
					if(isNaN(parseFloat(valB))) {
						valB = -1;
					}
					
					if (parseFloat(valA) == parseFloat(valB)) {
						result = 0;
					}
					else if (parseFloat(valA) > parseFloat(valB)) {
						result = 1;
					}
					else {
						result = -1;
					}
				}
				else {
					if (valA == valB) {
						result = 0;
					}
					else if (valA > valB) {
						result = 1;
					}
					else {
						result = -1;
					}
				}

				if (!isAscending) {
					result = result * -1;
				}

				return result;
			};
			
			if(typeof(self.NestedTreeNodesArray) != 'undefined' && null != self.NestedTreeNodesArray && self.NestedTreeNodesArray().length > 0) {
				self.NestedTreeNodesArray.sort(SortItemsByPropertyNameComparer);
			}
			
			for(var i = 0; i < self.FlatTreeNodesArray().length; i++) {
				var node = self.FlatTreeNodesArray()[i];
				
				if(typeof(node.Children) != 'undefined' && null != node.Children && node.Children().length > 0) {
					node.Children.sort(SortItemsByPropertyNameComparer);
				}
			}
		}
	};
	self.SortTree = function(comparer) {
		if(typeof(comparer) != 'undefined' && null != comparer) {
			if(typeof(self.FlatTreeNodesArray) != 'undefined' && null != self.FlatTreeNodesArray && self.FlatTreeNodesArray().length > 0) {
				if(typeof(self.NestedTreeNodesArray) != 'undefined' && null != self.NestedTreeNodesArray && self.NestedTreeNodesArray().length > 0) {
					self.NestedTreeNodesArray.sort(comparer);
				}
				
				for(var i = 0; i < self.FlatTreeNodesArray().length; i++) {
					var node = self.FlatTreeNodesArray()[i];
					
					if(typeof(node.Children) != 'undefined' && null != node.Children && node.Children().length > 0) {
						node.Children.sort(comparer);
					}
				}
			}
		}
	};
	
	self.GetTreeNodeById = function(nodeId, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains) {
		return self.GetTreeNodesByPropertyName(self.NodeDataIdPropertyName, nodeId, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, true);
	};
	self.GetTreeNodeByFullName = function(nodeFullName, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains) {
		var result = ko.observable(null);
		var regex;
		
		try {
			regex = new RegExp(nodeFullName, regularExpressionOptions);
		}
		catch(ex) {
			isRegularExpression = false;
		}
		
		if(typeof(self.FlatTreeNodesArray) != 'undefined' && null != self.FlatTreeNodesArray && self.FlatTreeNodesArray().length > 0) {
			result = self.FlatTreeNodesArray().where(function(node){
				var val = node.FullName();
				
				if(isRegularExpression) {
					var matches = regex.exec(val);
					return (typeof(matches) != "undefined" && null != matches && "" != matches.join("-"));
				}
				else {
					if(null != nodeFullName) {
						if(withTrimming) {
							nodeFullName = nodeFullName.toString().trim();
						}
						
						if(!caseSensitive) {
							nodeFullName = nodeFullName.toString().toLowerCase();
						}
					}
					
					if(null != val) {
						if(withTrimming) {
							val = val.toString().trim();
						}
						
						if(!caseSensitive) {
							val = val.toString().toLowerCase();
						}
					}
					
					if(contains) {
						return (val.indexOf(nodeFullName) != -1);
					}
					else {
						return (nodeFullName == val);
					}
				}
			}, true);
		}
		
		if(typeof(result) == 'undefined') {
			result = ko.observable(null);
		}
		
		return result;
	};
	self.GetTreeNodeByFullPath = function(nodeFullPath, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains) {
		var result = ko.observable(null);
		var regex;
		
		try {
			regex = new RegExp(nodeFullPath, regularExpressionOptions);
		}
		catch(ex) {
			isRegularExpression = false;
		}
		
		if(typeof(self.FlatTreeNodesArray) != 'undefined' && null != self.FlatTreeNodesArray && self.FlatTreeNodesArray().length > 0) {
			result = self.FlatTreeNodesArray().where(function(node){
				var val = node.FullPath();
				
				if(isRegularExpression) {
					var matches = regex.exec(val);
					return (typeof(matches) != "undefined" && null != matches && "" != matches.join("-"));
				}
				else {
				
					if(null != nodeFullPath) {
						if(withTrimming) {
							nodeFullPath = nodeFullPath.toString().trim();
						}
						
						if(!caseSensitive) {
							nodeFullPath = nodeFullPath.toString().toLowerCase();
						}
					}
					
					if(null != val) {
						if(withTrimming) {
							val = val.toString().trim();
						}
						
						if(!caseSensitive) {
							val = val.toString().toLowerCase();
						}
					}
					
					if(contains) {
						return (val.indexOf(nodeFullPath) != -1);
					}
					else {
						return (nodeFullPath == val);
					}
				}
			}, true);
		}
		
		if(typeof(result) == 'undefined') {
			result = ko.observable(null);
		}
		
		return result;
	};
	self.GetTreeNodesByParentId = function(nodeParentId, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains) {
		return self.GetTreeNodesByPropertyName(self.NodeDataParentIdPropertyName, nodeParentId, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains);
	};
	self.GetTreeNodesByDisplayName = function(nodeDisplayName, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains) {
		return self.GetTreeNodesByPropertyName(self.NodeDataDisplayNamePropertyName, nodeDisplayName, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains);
	};	
	self.GetTreeNodesByPropertyName = function(propertyName, propertyValue, isRegularExpression, regularExpressionOptions, withTrimming, caseSensitive, contains, firstOnly) {
		var result = null;
		var regex;
		
		try {
			regex = new RegExp(propertyValue, regularExpressionOptions);
		}
		catch(ex) {
			isRegularExpression = false;
		}
		
		if(typeof(self.FlatTreeNodesArray) != 'undefined' && null != self.FlatTreeNodesArray && self.FlatTreeNodesArray().length > 0) {
			result = self.FlatTreeNodesArray().where(function(node){
				var val = node.NodeData()[propertyName]();
				
				if(isRegularExpression) {
					var matches = regex.exec(val);
					return (typeof(matches) != "undefined" && null != matches && "" != matches.join("-"));
				}
				else {
					if(null != propertyValue) {
						if(withTrimming) {
							propertyValue = propertyValue.toString().trim();
						}
						
						if(!caseSensitive) {
							propertyValue = propertyValue.toString().toLowerCase();
						}
					}
			
					if(null != val) {
						if(withTrimming) {
							val = val.toString().trim();
						}
						
						if(!caseSensitive) {
							val = val.toString().toLowerCase();
						}
					}
					
					if(contains) {
						return (val.indexOf(propertyValue) != -1);
					}
					else {
						return (propertyValue == val);
					}
				}
			}, firstOnly);
		}
		
		var onlyFirst = false;
		
		if(typeof(firstOnly) != 'undefined' && null != firstOnly && true == firstOnly) {
			onlyFirst = true;
		}
		
		if((typeof(result) == 'undefined' || null == result) && onlyFirst) {
			result = ko.observable(null);
		}
		else if((typeof(result) == 'undefined' || null == result) && !onlyFirst) {
			result = ko.observableArray([]);
		}
		
		return result;
	};
	self.GetTreeNodesByDelegate = function(delegate, firstOnly) {
		var result = null;
		
		if(typeof(delegate) != 'undefined' && null != delegate) {
			if(typeof(self.FlatTreeNodesArray) != 'undefined' && null != self.FlatTreeNodesArray && self.FlatTreeNodesArray().length > 0) {
				result = self.FlatTreeNodesArray().where(delegate, firstOnly);
			}
			
			var onlyFirst = false;
			
			if(typeof(firstOnly) != 'undefined' && null != firstOnly && true == firstOnly) {
				onlyFirst = true;
			}
			
			if((typeof(result) == 'undefined' || null == result) && onlyFirst) {
				result = ko.observable(null);
			}
			else if((typeof(result) == 'undefined' || null == result) && !onlyFirst) {
				result = ko.observableArray([]);
			}
		}
		
		return result;
	};
	self.GetTreeNodes = function(nodeDataArray) {
		var rootNodeData = new Object();
		
		rootNodeData[self.NodeDataIdPropertyName] = -1;
		rootNodeData[self.NodeDataParentIdPropertyName] = null;
		rootNodeData[self.NodeDataDisplayNamePropertyName] = self.TopRootNodeName;
		
		var result = new TreeNode(rootNodeData, false, self.StartExpanded, false);
		
		var nodes = ko.observableArray([]);
		
		if(typeof(nodeDataArray) != 'undefined' && null != nodeDataArray && nodeDataArray.length > 0) {	
			for(var i = 0; i < nodeDataArray.length; i++) {
				var newNode = new TreeNode(nodeDataArray[i], false, self.StartExpanded, false);
				nodes.push(newNode);
			}
			
			if (typeof(nodes) != 'undefined' && null != nodes && nodes().length > 0) {
				for(var i = 0; i < nodes().length; i++) {
					self.FlatTreeNodesArray.push(nodes()[i]);
				}
			}
			
			var roots = nodes().where(function(node){
				return (node.ParentId() == null);
			});
			
			
			if (typeof(roots) != 'undefined' && null != roots && roots().length > 0) {
				for(var i = 0; i < roots().length; i++) {
					roots()[i].IsProcessed(true);
					roots()[i].Level(0);
					result.Children.push(roots()[i]);
				}
			}
			
			for(var i = 0; i < nodes().length; i++) {
				if (nodes()[i].IsProcessed()) {
					continue;
				}
				else {
					self.ProcessNode(result, nodes()[i], nodes);
				}
			}
		}
		
		return result.Children;
	};
	
	var actionInProgress = false;
	var bulkActionsQueue = new Queue();
	
	function WaitOthersThenApply(actionDelegate, delayBetweenBulksInMilli, interval, guid) {
		if(typeof(guid) == 'undefined' || null == guid || '' == guid) {
			guid = Guid();
			bulkActionsQueue.push(guid);
		}
		
		if(!actionInProgress && bulkActionsQueue.First() == guid) {
			if(typeof(interval) != 'undefined' && null != interval) {
				clearInterval(interval);
				interval = null;
			}
			
			if(typeof(actionDelegate) != 'undefined' && null != actionDelegate) {
				actionInProgress = true;
				actionDelegate();
			}
			
			bulkActionsQueue.pop();
			actionInProgress = false;
		}
		else {
			if(typeof(interval) == 'undefined' || null == interval) {
				interval = setInterval(function(){
					WaitOthersThenApply(actionDelegate, delayBetweenBulksInMilli, interval, guid);
				}, 2);
			}
		}	
	};
	
	function ApplyActionOnBulks(itemsArray, actionDelegate, bulkSize, delayBetweenBulksInMilli, interval, guid) {
		if(typeof(guid) == 'undefined' || null == guid || '' == guid) {
			guid = Guid();
			bulkActionsQueue.push(guid);
		}
		
		if(!actionInProgress && bulkActionsQueue.First() == guid) {
			if(typeof(interval) != 'undefined' && null != interval) {
				clearInterval(interval);
				interval = null;
			}
			
			if(typeof(itemsArray) != 'undefined' && null != itemsArray && itemsArray.length > 0) {
				actionInProgress = true;
				ProcessBulks(itemsArray, actionDelegate, bulkSize, 0, delayBetweenBulksInMilli, interval);
			}
		}
		else {
			if(typeof(interval) == 'undefined' || null == interval) {
				interval = setInterval(function(){
					ApplyActionOnBulks(itemsArray, actionDelegate, bulkSize, delayBetweenBulksInMilli, interval, guid);
				}, 2);
			}
		}	
	};
	
	function ProcessBulks(itemsArray, actionDelegate, bulkSize, bulkIndex, delayBetweenBulksInMilli, interval) {
		if(typeof(interval) != 'undefined' && null != interval) {
			clearInterval(interval);
			interval = null;
		}
		
		if(typeof(itemsArray) != 'undefined' && null != itemsArray && itemsArray.length > 0) {
			var numberOfPages = itemsArray.page(bulkSize).ActualNumberOfPages;
			
			if(numberOfPages > 0 && bulkIndex <= numberOfPages - 1) {
				var bulkItems = itemsArray.page(bulkSize, bulkIndex).Items;
				
				if(typeof(bulkItems) != 'undefined' && null != bulkItems && bulkItems.length > 0) {
					for(var k = 0; k < bulkItems.length; k++) {
						actionDelegate(bulkItems[k]);
					}
				}
				
				bulkIndex = bulkIndex + 1;
				
				var timeOut = setTimeout(function(){
					ProcessBulks(itemsArray, actionDelegate, bulkSize, bulkIndex, delayBetweenBulksInMilli);
				}, delayBetweenBulksInMilli);
			}
			else {
				bulkActionsQueue.pop();
				actionInProgress = false;
			}
		}
	};
	
	self.ProcessNode = function(rootNode, treeNode, treeNodesArray) {
		var parentNode = treeNodesArray().firstOrDefault(function(node) {
			return (typeof(treeNode.ParentId()) != 'undefined' && null != treeNode.ParentId()) && (node.Id().toString().trim().toLowerCase() == treeNode.ParentId().toString().trim().toLowerCase());
		}, null);
		
		if(typeof(parentNode) != 'undefined' && null != parentNode) {
			if (!parentNode.IsProcessed()) {
				self.ProcessNode(rootNode, parentNode, treeNodesArray);
			}

			treeNode.IsProcessed(true);
			treeNode.Level(parentNode.Level() + 1);
			treeNode.ParentId(parentNode.Id());
			
			if(typeof(parentNode.Children) == 'undefined' || null == parentNode.Children) {
				parentNode.Children = ko.observableArray([]);
			}
			
			parentNode.Children.push(treeNode);
		}
		else {
			treeNode.IsProcessed(true);
			treeNode.Level(0);
			treeNode.ParentId(null);
			
			if(typeof(rootNode) == 'undefined' || null == rootNode) {
				self.NestedTreeNodesArray.push(treeNode);
			}
			else {
				if(typeof(rootNode.Children) == 'undefined' || null == rootNode.Children) {
					rootNode.Children = ko.observableArray([]);
				}
			
				rootNode.Children.push(treeNode);
			}
		}
	};
	self.InitializeTree = function(nodesDataArray) {
		self.NestedTreeNodesArray = self.GetTreeNodes(nodesDataArray);
		self.SortTreeByPropertyName(self.SortByProperty().name, self.SortByProperty().isNumeric, self.SearchTextWithTrimming(), self.SearchTextCaseSensitive(), self.BooleanSortByDirectionIsAscending());
	};
	self.AddNode = function(nodeData) {
		var alreadyFound = false;
		
		if(typeof(self.FlatTreeNodesArray) != 'undefined' && null != self.FlatTreeNodesArray && self.FlatTreeNodesArray().length > 0) {
			var matchingNode = self.FlatTreeNodesArray().firstOrDefault(function(node) {
				return (node.Id() == nodeData[self.NodeDataIdPropertyName]);
			}, null);
			
			if(typeof(matchingNode) != 'undefined' && null != matchingNode) {
				alreadyFound = true;
			}
		}
		
		if(!alreadyFound) {
			var newNode = new TreeNode(nodeData, false, self.StartExpanded, false);
			self.FlatTreeNodesArray.push(newNode);
			
			self.ProcessNode(null, newNode, self.FlatTreeNodesArray);
		}
	};
	self.AddNodes = function(nodesDataArray) {
		var nodesToBeProcessed = new Array();
		
		if(typeof(nodesDataArray) != 'undefined' && null != nodesDataArray && nodesDataArray.length > 0) {
			for(var i = 0; i < nodesDataArray.length; i++) {
				if(typeof(self.FlatTreeNodesArray) != 'undefined' && null != self.FlatTreeNodesArray && self.FlatTreeNodesArray().length > 0) {
					var matchingNode = self.FlatTreeNodesArray().firstOrDefault(function(node) {
						return (node.Id() == nodesDataArray[i][self.NodeDataIdPropertyName]);
					}, null);
					
					if(typeof(matchingNode) == 'undefined' || null == matchingNode) {
						var newNode = new TreeNode(nodesDataArray[i], false, self.StartExpanded, false);
						self.FlatTreeNodesArray.push(newNode);
						nodesToBeProcessed.push(newNode);
					}
				}
			}
			
			for(var i = 0; i < nodesToBeProcessed.length; i++) {
				self.ProcessNode(null, nodesToBeProcessed[i], self.FlatTreeNodesArray);
			}
		}
	};
	self.PrintTree = function(rootNode) {
		if(typeof(rootNode) != 'undefined' && null != rootNode) {
			console.log("-".repeat(rootNode.Level()) + rootNode.FullName());
			
			if(typeof(rootNode.Children) != 'undefined' && null != rootNode.Children && rootNode.Children().length > 0) {	
				for(var i = 0; i < rootNode.Children().length; i++) {
					self.PrintTree(rootNode.Children()[i]);
				}
			}
		}
		else {
			if(typeof(self.NestedTreeNodesArray) != 'undefined' && null != self.NestedTreeNodesArray && self.NestedTreeNodesArray().length > 0) {
				for(var i = 0; i < self.NestedTreeNodesArray().length; i++) {
					self.PrintTree(self.NestedTreeNodesArray()[i]);
				}
			}
		}
	};
	
	function TreeNode(nodeData, isProcessed, isExpanded, isSelected) {
		var tn = this;
		
		tn.private_IsProcessed = ko.observable(isProcessed);
		tn.IsProcessed = ko.computed({
			read: function () {
				return tn.private_IsProcessed();
			},
			write: function (value) {
				tn.private_IsProcessed(value);
			},
			deferEvaluation: true
		});
		
		tn.private_IsExpanded = ko.observable(isExpanded);
		tn.IsExpanded = ko.computed({
			read: function () {
				return tn.private_IsExpanded();
			},
			write: function (value) {
				tn.private_IsExpanded(value);
			},
			deferEvaluation: true
		});
		
		tn.private_IsSelected = ko.observable(isSelected);
		tn.IsSelected = ko.computed({
			read: function () {
				return tn.private_IsSelected();
			},
			write: function (value) {
				tn.private_IsSelected(value);
			},
			deferEvaluation: true
		});
		
		tn.private_IsHighlighted = ko.observable(false);
		tn.IsHighlighted = ko.computed({
			read: function () {
				return tn.private_IsHighlighted();
			},
			write: function (value) {
				tn.private_IsHighlighted(value);
			},
			deferEvaluation: true
		});
		
		tn.private_Level = ko.observable(0);
		tn.Level = ko.computed({
			read: function () {
				return tn.private_Level();
			},
			write: function (value) {
				tn.private_Level(value);
			},
			deferEvaluation: true
		});
		
		tn.Children = ko.observableArray([]);
		
		tn.private_NodeData =  ko.observable(ko.mapping.fromJS(nodeData));
		tn.NodeData = ko.computed({
			read: function () {
				return tn.private_NodeData();
			},
			write: function (value) {
				tn.private_NodeData(value);
			},
			deferEvaluation: true
		});
		
		tn.private_Id = ko.observable(nodeData[self.NodeDataIdPropertyName]);
		tn.Id = ko.computed({
			read: function () {
				return tn.private_Id();
			},
			write: function (value) {
				tn.private_Id(value);
			},
			deferEvaluation: true
		});
		
		tn.private_ParentId = ko.observable(nodeData[self.NodeDataParentIdPropertyName]);
		tn.ParentId = ko.computed({
			read: function () {
				return tn.private_ParentId();
			},
			write: function (value) {
				tn.private_ParentId(value);
			},
			deferEvaluation: true
		});
		
		tn.private_DisplayName = ko.observable(nodeData[self.NodeDataDisplayNamePropertyName]);
		tn.DisplayName = ko.computed({
			read: function () {
				return tn.private_DisplayName();
			},
			write: function (value) {
				tn.private_DisplayName(value);
			},
			deferEvaluation: true
		});
		
		tn.HasChildren = ko.computed({
			read: function () {
				return (typeof(tn.Children) != 'undefined' && null != tn.Children && tn.Children().length > 0);
			},
			deferEvaluation: true
		});
		
		tn.FullPath = function () {
			return tn.GetHierPropertyPath(self.NodeDataIdPropertyName, self.HierSeparator);
		};
		
		tn.FullName = function () {
			return tn.GetHierPropertyPath(self.NodeDataDisplayNamePropertyName, self.HierSeparator);
		};
		
		tn.IsLastSibling = function () {
			var result = false;
			
			if(typeof(tn.ParentId) == 'undefined' || null == tn.ParentId || typeof(tn.ParentId()) == 'undefined' || null == tn.ParentId()) {
				if(typeof(self.NestedTreeNodesArray) != 'undefined' && null != self.NestedTreeNodesArray && self.NestedTreeNodesArray().length > 0) {
					if(self.FlatTreeNodesArray().length == 1) {
						result = true;
					}
					else {
						var lastItemId = self.NestedTreeNodesArray()[self.NestedTreeNodesArray().length - 1].Id();
						if(lastItemId == tn.Id()) {
							result = true;
						}
					}
				}
			}
			else {
				var parent = self.GetTreeNodeById(tn.ParentId(), false, "", true, true, false);
				if(typeof(parent.Children) != 'undefined' && null != parent.Children && parent.Children().length > 0) {
					var lastItemId = parent.Children()[parent.Children().length - 1].Id();
					if(lastItemId == tn.Id()) {
						result = true;
					}
				}
			}
			
			return result;
		};
		
		tn.FullPathFromParentToChildArray = function () {
			var result = ko.observableArray([]);

			if (typeof(tn.Id) != 'undefined' && null != tn.Id) {
				result.push(tn.Id());
				
				if (typeof(tn.ParentId) != 'undefined' && null != tn.ParentId && null != tn.ParentId() && typeof(self.FlatTreeNodesArray) != 'undefined' && null != self.FlatTreeNodesArray && self.FlatTreeNodesArray().length > 0) {
					var parent = self.FlatTreeNodesArray().firstOrDefault(function(treeNode){
						return (treeNode.Id().toString().trim().toLowerCase() == tn.ParentId().toString().trim().toLowerCase());
					}, null);
					
					if (typeof(parent) != 'undefined' && null != parent) {
						var parentFullPathFromParentToChildArray = parent.FullPathFromParentToChildArray();
						
						if (typeof(parentFullPathFromParentToChildArray) != 'undefined' && null != parentFullPathFromParentToChildArray && parentFullPathFromParentToChildArray().length > 0) {
							parentFullPathFromParentToChildArray.reverse();
							
							for(var i = 0; i < parentFullPathFromParentToChildArray().length; i++) {
								result.push(parentFullPathFromParentToChildArray()[i]);
							}
						}
					}
				}
			}

			result.reverse();
			
			return result;
		};
		
		tn.GetHierPropertyPath = function(propertyName, separator){
			var result = '';
			
			var finalSeparator = self.HierSeparator;
			
			if (typeof(separator) != 'undefined' && null != separator) {
				finalSeparator = separator;
			}
			
			var hierArray = tn.FullPathFromParentToChildArray();
			
			if (typeof(hierArray) != 'undefined' && null != hierArray && hierArray().length > 0) {
				var startingMatchingNode = self.FlatTreeNodesArray().firstOrDefault(function(node){
					return (node.Id().toString().trim().toLowerCase() == hierArray()[0].toString().trim().toLowerCase());
				}, null);
				
				if (typeof(startingMatchingNode) != 'undefined' && null != startingMatchingNode) {
					result += startingMatchingNode.NodeData()[propertyName]().toString();
				}
				
				if(hierArray().length > 1) {
					for(var i = 1; i < hierArray().length; i++) {
						var matchingNode = self.FlatTreeNodesArray().firstOrDefault(function(node){
							return (node.Id().toString().trim().toLowerCase() == hierArray()[i].toString().trim().toLowerCase());
						}, null);
						
						result = result + finalSeparator + matchingNode.NodeData()[propertyName]().toString();
					}
				}
			}
			
			return result;
		};
		
		return tn;
	}
	
	return self;
}