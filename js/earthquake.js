
//------------------
MAX_NUM_TWEETS = 100;
//------------------

//global vars
magnitudo 	= new Array();
latitude 	= new Array();
longitude 	= new Array();
depth 		= new Array();
time  		= new Array();
date		= new Array();

var tweetsToRead = MAX_NUM_TWEETS;

//---------------------------------------
function retrieveTweets(MAX_NUM_TWEETS)
//---------------------------------------
{
	var tweeturl = "http://search.twitter.com/search.json?callback=?&rpp=" + MAX_NUM_TWEETS + "&q=from:INGVterremoti";

	$.getJSON(tweeturl, function(d) {

		var tweetRes = d.results;	//array dei tweet

		tweetsToRead = tweetRes.length;

		for (i=0; i<tweetsToRead; i++) {

			//parso il campo "text" per estrarre le info che mi servono
			var myString = new String ( tweetRes[i].text );

			var myPropertyList = myString.split(" ");

			for( k=0; k<myPropertyList.length; k++ )
			{
				if( k==1 )	//magnitudo
					magnitudo[i] = parseFloat( myPropertyList[k].substr(3) );

				if( k==2 )	//data
					date[i] = myPropertyList[k];

				if( k==3 )	//ora
					time[i] = myPropertyList[k];

				if( k==5 )	//lat
					latitude[i] = myPropertyList[k].substr(4);

				if( k==6 )	//lon
					longitude[i] = myPropertyList[k].substr(4);

				if( k==7 )	//prof
					depth[i] = parseFloat(myPropertyList[k].substr(5,myPropertyList[k].length -7 ));	//-7 perchè devo togliere "Km" alla fine e "Prof=" all'inizio
			}
		}
		//per recuperare la location del tweet!!!
		// http://api.twitter.com/1/geo/reverse_geocode.json?lat=44.92&long=10.92  <<<<<<
	});
}


google.load("visualization", "1", {packages:["corechart"]});

retrieveTweets(MAX_NUM_TWEETS);

google.setOnLoadCallback(drawChart);

//----------------------
function drawChart() 
//----------------------
{
	var dataMagnitudo = new google.visualization.DataTable();
	dataMagnitudo.addColumn('datetime', 'Date');
	dataMagnitudo.addColumn('number',   'Magnitudo');
	dataMagnitudo.addColumn({type:'string',role:'tooltip'});
	dataMagnitudo.addRows(tweetsToRead);

	var dataDepth = new google.visualization.DataTable();
	dataDepth.addColumn('datetime', 'Date');
	dataDepth.addColumn('number',   'Depth (km)');
	dataDepth.addRows(tweetsToRead);

	for( i=0; i<tweetsToRead; i++ )
	{
		//dataMagnitudo.setCell(i, 0, i);
		var timeElements = time[i].split(":");
		var dateElements = date[i].split("-");
		var datetime = new Date(dateElements[0], dateElements[1], dateElements[2], timeElements[0], timeElements[1], timeElements[2]);
		datetime.setHours(datetime.getHours()+2);	//per ora legale

		dataMagnitudo.setCell(i, 0, datetime);
		dataMagnitudo.setCell(i, 1, magnitudo[i]);

		dataMagnitudo.setCell(i, 2, 'Magnitudo: '+magnitudo[i]+'\u000D\u000A'+datetime.toString());

		dataDepth.setCell(i, 0, datetime);
		dataDepth.setCell(i, 1, depth[i]);
	}

	var optionsMagnitudo = {
	  title: 'Last ' + tweetsToRead + ' events: Magnitudo',
	  colors: ['red']
	};

	var optionsDepth = {
	  title: 'Last ' + tweetsToRead + ' events: Depth',
	  colors: ['green']
	};

	//riordino dati in base alla data
	dataMagnitudo.sort([{column: 0}]);
	dataDepth.sort([{column: 0}]);

	//disegno grafico magnitudo
	var chartMagnitudo = new google.visualization.LineChart(document.getElementById('chart_magnitudo'));
	chartMagnitudo.draw(dataMagnitudo, optionsMagnitudo);

	//disegno grafico depth
	var chartDepth = new google.visualization.LineChart(document.getElementById('chart_depth'));
	chartDepth.draw(dataDepth, optionsDepth);
}
