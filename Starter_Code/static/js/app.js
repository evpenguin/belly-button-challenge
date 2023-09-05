const samples = "https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json";

//datapromise 
const dataPromise = d3.json(samples);
console.log("Data Promise: ", dataPromise);

//load data
d3.json(samples).then(function(data) {
    const json_data = data
    console.log(json_data); 
    
    //populate the dropdown list
    create_dropdowns(json_data);
});

//populates the dropdown list with all the sample ID's
function create_dropdowns(json_data) {
    console.log(json_data);
    let dropdownMenu = d3.select("#selDataset")
    let names = json_data.names;
    for(let i = 0; i < names.length; i++) {
        dropdownMenu.append("option").text(names[i]).property("value", names[i]);
    }
    optionChanged("940");
};


// This function is called when a dropdown menu item is selected, it refreshed all the graphs
function optionChanged(sample_id) {
  //load data so we can work with it
  d3.json(samples).then(function(data) {
    const json_data = data
    console.log(json_data); 
  
    //filter function to select the sample we want to work with
    function id_filter(sample) {
      return sample.id == sample_id;
    }
  
    //assign sample data to variables and log
    let sample_data = json_data["samples"].filter(id_filter)[0];
    let sample_metadata = json_data["metadata"].filter(id_filter)[0];

    //metadata table
    //this function 'unzips' the metadata json so we can more easily work with it
    //it also empties the demographics table
    function unwrap(item) {

      //delete previous data
      let demo_table_rows = d3.selectAll("p");
      demo_table_rows.remove();

      //create array of strings with the info
      let demographics = [];
      for(var key in item) {
        demographics.push(`${key}: ${item[key]}`);
      }

      return demographics;
    }

    //unwrap metadata into strings
    let metadata = unwrap(sample_metadata);
    //add new paragraph element for each line of metadata
    for(let i=0; i < metadata.length; i++) {
    let demographics = d3.select('#sample-metadata').append('p').text(metadata[i])
    }
    
    //bar chart
    //restructure, sort and slice data
    let prepped_data = prep_sort(sample_data);
    let sorted_by_sample_values = prepped_data.sort((a, b) => b.sample_values - a.sample_values);
    let sample_values_slice = sorted_by_sample_values.slice(0,10);
    sample_values_slice.reverse();
    //create bar data
    let horizontal_bar = [{
      type: "bar",
      x: sample_values_slice.map(item => item.sample_values),
      y: sample_values_slice.map(item => `OTU ${item.otu_ids}`),
      text: sample_values_slice.map(item => item.otu_labels),
      orientation: 'h'
    }];

    //this 'unzips' the json data so the sort function will work properly on it
    function prep_sort(dictionary) {
      unzipped = [];
      for(let i = 0; i < dictionary.sample_values.length; i++) {
        let dict = {};
        for(var key in dictionary) {
          dict[key] = dictionary[key][i];
        }
        unzipped.push(dict);
      }
      return unzipped;
    };

    //add title
    let bar_layout = {
      title: 'Top 10 OTU\'s '
    }

    //plot the bar chart
    Plotly.newPlot('bar', horizontal_bar, bar_layout, {responsive: true});

    //bubble chart
    let bubble = [{
      x: sample_data.otu_ids,
      y: sample_data.sample_values,
      text: sample_data.otu_labels,
      mode: 'markers',
      marker: {
        size: sample_data.sample_values,
        color: sample_data.otu_ids,
        colorscale: 'Earth'
      }
    }];

    //add x-axis label
    let bubble_layout = {
      xaxis: {
        title: {
          text: "OTU ID"
        }
      },
    };

    //plot bubble
    Plotly.newPlot('bubble', bubble, bubble_layout, {responsive: true});

  //   //gauge - no way mate, way to much for a weekly challenge
  //   var gauge_data = [
  //     {
  //       domain: { x: [0, 1], y: [0, 1] },
  //       value: sample_metadata.wfreq,
  //       title: { text: "Belly Button Washing Frequency" },
  //       type: "indicator",
  //       mode: "gauge+number",
  //       gauge: {
  //         axis: { range: [null, 9] },
  //         steps: [
  //           { range: [0, 1], color: "white" },
  //           { range: [1, 2], color: "green" }
  //         ],
  //         bar: { color: "black"}
  //     }
  // }];
    
  //   var layout = { width: 600, height: 500, margin: { t: 0, b: 0 } };
  //   Plotly.newPlot('gauge', gauge_data, layout, {responsive: true});

  });
}