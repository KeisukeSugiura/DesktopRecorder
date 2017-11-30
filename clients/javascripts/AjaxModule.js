/*
	AjaxでAPIを利用するためのライブラリ
	require jQuery 
 */
var AjaxModule = (function(){
	

	function ajaxPostModel(url, _dataType,_contentType, _doneFn, _failFn, _alwaysFn){
		return function(data, __doneFn, __failFn, __alwaysFn) {
				    var dataType = _dataType || "text";
				    var contentType = _contentType || "application/x-www-form-urlencoded";
				    var doneFn = _doneFn || __doneFn || function(data){console.log(data)};
				    var failFn = _failFn || __failFn || function(data){console.log(data)};
				    var alwaysFn = _alwaysFn || __alwaysFn || function(data){};

				    $.ajax({
				      url: url,
				      data: data,
				      dataType: dataType,
				      contentType: contentType,
				      type: 'post',
				      timeout: 10000
					})
					   //通信が成功したとき
					   .done(function(data){doneFn(data);})
					   //通信が失敗したとき
					   .fail(function(data){failFn(data);})
					   //通信が終わったとき
					   .always(function(data){alwaysFn(data);});
				};
	}

	function ajaxGetModel(url, _dataType, _doneFn, _failFn, _alwaysFn){
		return function(data, __doneFn, __failFn, __alwaysFn){
					var dataType = _dataType || "text";
					var doneFn = _doneFn || __doneFn || function(data){console.log(data);}
					var failFn = _failFn || __failFn || function(data){console.log(data);}
					var alwaysFn = _alwaysFn || __alwaysFn || function(data){}

					$.ajax({
				      url: url,
				      data: data,
				      dataType: dataType,
				      type: 'get',
				      timeout: 10000,
				     })
				     //通信が成功したとき
				     .done(function(data){doneFn(data);})
				     //通信が失敗したとき
				     .fail(function(data){failFn(data);})
				     //通信が終わったとき
				     .always(function(data){alwaysFn(data);});
		    	};
	}

	var modules = {};

	/*
		api for client
	 */

	 modules.getUserData = ajaxGetModel('/api/userData', 'json');
	 modules.getUserDataIncomplete = ajaxGetModel('/api/userData/incomplete', 'json');

	 modules.getIncompleteToDoList = ajaxGetModel('/api/todo/incomplete', 'json');
	 modules.getCompleteToDoList = ajaxGetModel('/api/todo/complete', 'json');
	 modules.getAllToDoList = ajaxGetModel('/api/todo/all', 'json');
	 modules.getDetailToDoList = ajaxGetModel('/api/todo/detail', 'json');

	 modules.getIncompleteProject = ajaxGetModel('/api/project/incomplete', 'json');
	 modules.getCompleteProject = ajaxGetModel('/api/project/complete', 'json');
	 modules.getAllProject = ajaxGetModel('/api/project/all', 'json');
	 modules.getDetailToDoList = ajaxGetModel('/api/project/detail', 'json');

	 modules.postInsertToDo = ajaxPostModel('/api/todoObj/insert', 'json');
	 modules.postUpsertToDo = ajaxPostModel('/api/todoObj/upsert', 'json');
	 modules.postInsertProject = ajaxPostModel('/api/projectObj/insert', 'json');
	 modules.postUpsertProject = ajaxPostModel('/api/projectObj/upsert', 'json');

	 modules.postRemoveToDo = ajaxPostModel('/api/todoObj/remove', 'json');
	 modules.postCompleteToDo = ajaxPostModel('/api/todoObj/complete', 'json');
	 modules.postRemoveProject = ajaxPostModel('/api/projectObj/remove', 'json');
	 modules.postCOmpleteproject = ajaxPostModel('/api/projectObj/complete', 'json');

	 modules.getToDoListWithTag = ajaxGetModel('/api/todo/search/tag', 'json');

	/*
		crud api for super user
		url example : /api/User/find, /api/Password/upsert...
		how to use : AjaxModule["dbName"].find(data, successFn, errorFn, doneFn)
	 */
	var getKeys = ajaxGetModel('/api/keys', 'json')({}, function(data){
		data.keys.forEach(function(dbName, dbInd, dbArr){
			modules[dbName] = {};
			modules[dbName]['find'] = ajaxGetModel('/api/'+dbName+'/find', 'json');
			['insert', 'upsert', 'remove'].forEach(function(cudName, cudInd, cudArr){
				modules[dbName][cudName] = ajaxPostModel('/api/'+dbName+'/'+cudName, 'json');
			});
		});
	});

	return modules;

})();