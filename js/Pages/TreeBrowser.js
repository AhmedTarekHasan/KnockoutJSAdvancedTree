var RegularExpressionsErroressage = "Something is wrong with your regular expression or its modifiers";
var TreeBrowserViewModel = null;

$(document).ready(function(){
	$(document).on("mouseover", ".unselectable", function(){
		if(!$(this).hasClass("selection-disabled")) {
			disableSelection($(this));
			$(this).addClass("selection-disabled");
		}
	});
	
	TreeBrowserViewModel = new TreeViewModel({
		hierSeparator: "|",
		nodeDataIdPropertyName: "Id",
		nodeDataParentIdPropertyName: "ParentId",
		nodeDataDisplayNamePropertyName: "Name",
		startExpanded: false,
		searchTextWithTrimming: false,
		searchTextCaseSensitive: false,
		searchTextMatchWhole: false,
		searchTextIsRegularExpression: false,
		nodeDataPropertiesArray: [ { "name": "Name", "value": "Name", "isNumeric": false },
		{ "name": "Id", "value": "Id", "isNumeric": true },
		{ "name": "Parent Id", "value": "ParentId", "isNumeric": true },
		{ "name": "Path", "value": "Path", "isNumeric": false },
		{ "name": "Creation Date", "value": "CreationDate", "isNumeric": false } ],
		sortByPropertyName: "Name",
		sortByIsAscending: true,
		slicingDelayInMilliSeconds: 2,
		slicingBulkSize: 500
	});
		
	TreeBrowserViewModel.InitializeTree(nodesDataArray);
	
	TreeBrowserViewModel.Search = function() {
		if(null != TreeBrowserViewModel.SearchText() && '' != TreeBrowserViewModel.SearchText()) {
			var searchTextPropertyName = TreeBrowserViewModel.SearchTextPropertyName().value;
			var searchText = TreeBrowserViewModel.SearchText();
			var searchTextIsRegularExpression = TreeBrowserViewModel.SearchTextIsRegularExpression();
			var searchTextRegularExpressionOptions = TreeBrowserViewModel.SearchTextRegularExpressionOptions();
			var searchTextWithTrimming = TreeBrowserViewModel.SearchTextWithTrimming();
			var searchTextCaseSensitive = TreeBrowserViewModel.SearchTextCaseSensitive();
			var searchTextMatchWhole = TreeBrowserViewModel.SearchTextMatchWhole();
			
			if(searchTextIsRegularExpression) {
				try {
					regex = new RegExp(searchText, searchTextRegularExpressionOptions);
				}
				catch(ex) {
					alert(RegularExpressionsErroressage);
					return;
				}
			}
			
			TreeBrowserViewModel.CollapseAll();
			TreeBrowserViewModel.DehighlightAll();
			TreeBrowserViewModel.ExpandToNodesByPropertyName(searchTextPropertyName, searchText, searchTextIsRegularExpression, searchTextRegularExpressionOptions, searchTextWithTrimming, searchTextCaseSensitive, !searchTextMatchWhole, false);
		}
	};
	
	$("#TreeHolderDiv").load('KOTemplates/TreeBrowser_Template.html',
		function () {
			ko.cleanNode($("#TreeHolderDiv")[0]);
			if (!isBound('TreeHolderDiv')) {
				ko.applyBindings(TreeBrowserViewModel, $("#TreeHolderDiv")[0]);
			}
			
			$("#ContentDetailsHolderDiv").load('KOTemplates/ContentDetails_Template.html',
				function () {
					ko.cleanNode($("#ContentDetailsHolderDiv")[0]);
					if (!isBound('ContentDetailsHolderDiv')) {
						ko.applyBindings(TreeBrowserViewModel.FirstSelectedNode, $("#ContentDetailsHolderDiv")[0]);
					}
				}
			);
		}
	);
});