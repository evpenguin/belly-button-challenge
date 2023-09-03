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
    console.log(sample_data);
    console.log(sample_metadata);

    //metadata table
    function unwrap(item) {

      //delete previous data
      let demo_table_rows = d3.selectAll("p");
      demo_table_rows.remove();

      
      let demographics = [];
      for(var key in item) {
        demographics.push(`${key}: ${item[key]}`);
      }

      return demographics;
    }

    let metadata = unwrap(sample_metadata);
    for(let i=0; i < metadata.length; i++) {
    let demographics = d3.select('#sample-metadata').append('p').text(metadata[i])
    }
    
    //bar chart
    let prepped_data = prep_sort(sample_data);
    let sorted_by_sample_values = prepped_data.sort((a, b) => b.sample_values - a.sample_values);
    let sample_values_slice = sorted_by_sample_values.slice(0,10);
    let horizontal_bar = [{
      type: "bar",
      x: sample_values_slice.map(item => item.sample_values),
      y: sample_values_slice.map(item => `OTU ${item.otu_ids}`),
      text: sample_values_slice.map(item => item.otu_labels),
      orientation: 'h'
    }];

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

    console.log(prep_sort(sample_data))

    Plotly.newPlot('bar', horizontal_bar);

    //bubble chart
    
  });
}