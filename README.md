# datePicker
简单移动端日期选择
效果图如下：

![datePicker](date.png)

# 用法
	<!DOCTYPE>
	<html>
		<head>
			<title>时间选择器</title>
			<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
			<link rel="stylesheet" type="text/css" href="./datepicker.css">
			<script type="text/javascript" src="./datepicker.js"></script>
		</head>
		<body>
			<input type="text" name="date" readonly="readonly" id="date1" />
			<br/><br/><br/>
			<input type="text" name="date" readonly="readonly" id="date2" />
			
			<script type="text/javascript">
				var dp = new DatePicker();

				var dateOpts = {
					ele:document.querySelector('#date2'),
					type:'date',
					min:'1990-01-05',
					max:'2020-08-26',
					init:'2018-10-11'
				}

				dp.result = function(v){
					dp.target.value = v.map(function(a){ return a.length > 1 ? a : '0'+a; }).join('-');
				};

				dp.bind({
					ele:document.querySelector('#date1'),
					type:'date'
				});

				dp.bind(dateOpts);

				//if change opts
				dateOpts.min = '1991-04-19';
			</script>
		</body>
	</html>