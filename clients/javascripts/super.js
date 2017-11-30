


function getAllDatas(){
	//get -> search form -> insert form
	var select = $("[name=datasRadios]:checked").val();
	console.log(select);
	AjaxModule[select].find({},function(data){
		console.log(data);
		var schema = data.schema;
		if(data.datas.length == 0){
			//console.log(schema);
			//console.log(Object.keys(schema).length);
			setForms(select,schema);
		}else{
			var datas = data.datas;
			setForms(select,schema);
			showDatas(select,schema,datas);
			//console.log(datas);
		}

	},function(data){
		//error
		console.error(data);
	});
};

function setForms(select,data_struct){
	var keys = Object.keys(data_struct);
	var length = keys.length;
	var insert_div = document.getElementById('insert_form');
	var search_div = document.getElementById('search_form');

	var input_forms = [];
	keys.forEach(function(elm,index,arr){
		var input = document.createElement('input');
		input.setAttribute('placeholder',elm);
		input.setAttribute('class',elm);
		insert_div.appendChild(input);
	});

	$('#insert_button').off('click');
	$('#insert_button').on('click',function(e){
		var sendObject = {};
		keys.forEach(function(elm,index,arr){
			sendObject[elm] = $('#insert_form input.'+elm).val();
		});
		console.log(sendObject);
		AjaxModule[select].insert(sendObject,
			function(){
				var sendObject = {};
				keys.forEach(function(elm,index,arr){
					var item = $('#search_form input.'+elm).val();
					if(item != ""){
						sendObject[elm] = $('#search_form input.'+elm).val();
					}
				});
				console.log(sendObject);
				AjaxModule[select].find(sendObject,function(data){
					var select = $("[name=datasRadios]:checked").val();
					var schema = data.schema;
					var datas = data.datas;
					$('#insert_form').empty();
					$('#search_form').empty();
					$('#data_table').empty();
					setForms(select,schema);
					showDatas(select,schema,datas);
					Object.keys(sendObject).forEach(function(elm,index,arr){
						$('#search_form input.'+elm).val(sendObject[elm]);
					});
				});

			},
			function(){

			});
	});

	keys.forEach(function(elm,index,arr){
		var input = document.createElement('input');
		input.setAttribute('placeholder',elm);
		input.setAttribute('class',elm);
		search_div.appendChild(input);
	});

	$('#search_button').off('click');
	$('#search_button').on('click',function(e){
		var sendObject = {};
		keys.forEach(function(elm,index,arr){
			var item = $('#search_form input.'+elm).val();
			if(item != ""){
				sendObject[elm] = $('#search_form input.'+elm).val();
			}
		});
		console.log(sendObject);
		AjaxModule[select].find(sendObject,function(data){
			var select = $("[name=datasRadios]:checked").val();
			var schema = data.schema;
			var datas = data.datas;
			$('#insert_form').empty();
			$('#search_form').empty();
			$('#data_table').empty();
			setForms(select,schema);
			showDatas(select,schema,datas);
			Object.keys(sendObject).forEach(function(elm,index,arr){
				$('#search_form input.'+elm).val(sendObject[elm]);
			});
		});
	});

};

function showDatas(select,schema,datas){
	var schema_keys = Object.keys(schema);

	var div_data_table = document.getElementById('data_table');
	//table
	var data_table = document.createElement('table');
	data_table.setAttribute('class', "table table-responsive table-bordered");
	//data_table.contentEditable=true;
	//table head
	var table_head = document.createElement('thead');

	schema_keys.forEach(function(elm,index,arr){
		var th = document.createElement('th');
		th.innerHTML = elm;
		table_head.appendChild(th);
	});

	var update_th = document.createElement('th');
	update_th.innerHTML = '[update]';
	var delete_th = document.createElement('th');
	delete_th.innerHTML = '[delete]'

	table_head.appendChild(update_th);
	table_head.appendChild(delete_th);
	data_table.appendChild(table_head);

	//tabla body
	var table_body = document.createElement('tbody');

	datas.forEach(function(element,index,arr){
		var tr = document.createElement('tr');
		schema_keys.forEach(function(elm,index,arr){
			var td = document.createElement('td');
			td.setAttribute('class', elm);
			td.contentEditable = true;
			td.innerHTML = element[elm];
			tr.appendChild(td);
		});

		var u_td = document.createElement('td');
		u_td.setAttribute('class','ctr_button');
		var u_btn = document.createElement('button');
		u_btn.setAttribute('class', 'btn btn-warning update_button');
		u_btn.setAttribute('data-id',element['_id']);
		u_btn.innerHTML = 'update';
		u_td.appendChild(u_btn);

		var d_td = document.createElement('td');
		d_td.setAttribute('class','ctr_button');
		var d_btn = document.createElement('button');
		d_btn.setAttribute('data-id', element['_id']);
		d_btn.setAttribute('class', 'btn btn-danger delete_button');
		d_btn.innerHTML = 'delete';
		d_td.appendChild(d_btn);

		tr.appendChild(u_td);
		tr.appendChild(d_td);

		table_body.appendChild(tr);
	});

	data_table.appendChild(table_body);
	div_data_table.appendChild(data_table);


	$(".delete_button").off('click');
	$(".delete_button").on('click',function(e){

		var datas = $(this).parent().parent().children();
		var sendObject = {};
		//Danger 取得がすべてStringになる。パースがうまくいくか注意する。
		schema_keys.forEach(function(element,index,arr){
			datas.each(function(i,elm){
				var cn = elm.className;
				console.log(cn);
				if(cn == element){
					sendObject[cn] = elm.innerHTML;
				}
			});
		});
		sendObject._id = $(this).attr('data-id');
		console.log(sendObject);
		AjaxModule[select].remove(sendObject,function(res){
			var sendObject = {};

			schema_keys.forEach(function(elm,index,arr){
				var item = $('#search_form input.'+elm).val();
				if(item != ""){
					sendObject[elm] = $('#search_form input.'+elm).val();
				}
			});

			AjaxModule[select].find(sendObject,function(data){
				var select = $("[name=datasRadios]:checked").val();
				var schema = data.schema;
				var datas = data.datas;
				$('#insert_form').empty();
				$('#search_form').empty();
				$('#data_table').empty();
				setForms(select,schema);
				showDatas(select,schema,datas);
				Object.keys(sendObject).forEach(function(elm,index,arr){
					$('#search_form input.'+elm).val(sendObject[elm]);
				});
			});
		});

	});

	$(".update_button").off('click');
	$(".update_button").on('click',function(e){

		var datas = $(this).parent().parent().children();
		var sendObject = {};
		//Danger 取得がすべてStringになる。パースがうまくいくか注意する。
		schema_keys.forEach(function(element,index,arr){
			datas.each(function(i,elm){
				var cn = elm.className;
				console.log(cn);
				if(cn == element){
					sendObject[cn] = elm.innerHTML;
				}
			});
		});
		sendObject._id = $(this).attr('data-id');
		console.log(sendObject);
		AjaxModule[select].upsert(sendObject,function(res){
			var sendObject = {};
			schema_keys.forEach(function(elm,index,arr){
				var item = $('#search_form input.'+elm).val();
				if(item != ""){
					sendObject[elm] = $('#search_form input.'+elm).val();
				}
			});

			AjaxModule[select].find(sendObject,function(data){
				var select = $("[name=datasRadios]:checked").val();
				var schema = data.schema;
				var datas = data.datas;
				$('#insert_form').empty();
				$('#search_form').empty();
				$('#data_table').empty();
				setForms(select,schema);
				showDatas(select,schema,datas);
				Object.keys(sendObject).forEach(function(elm,index,arr){
					$('#search_form input.'+elm).val(sendObject[elm]);
				});
			});
		});
	});
};



$("input[name='datasRadios']:radio").change(function(){
	$('#insert_form').empty();
	$('#search_form').empty();
	$('#data_table').empty();
	getAllDatas();
});