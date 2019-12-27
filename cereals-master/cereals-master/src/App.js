import React, {Component} from 'react';
import './App.css';
import CerealData from './cerealData';
import Questions from './components/Questions';
import BarChart from './components/BarChart';
import SelectedCereal from './components/SelectedCereal';
import SimplePieChart from './components/SimplePieChart';
import MathJax from 'react-mathjax2';
import ToggleButton from 'react-toggle-button';
import SimpleScatterChart from './components/SimpleScatterChart';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      cereals: [],
      questions: [],
      gains: [0, 0, 0, 0, 0, 0, 0],
      veganToggle: false,
      glutenToggle: false,
      organicToggle: false,
      showScatter: false,
      rawToggle: false,
      pieChartColors: [
        '#ff99cc',
        '#ff9980',
        '#ffcc80',
        '#cc9900',
        '#66cc66',
        '#6699ff',
        '#ac39ac',
      ],
      selectedCereal: {
        id: 0,
        name: '',
        manufacturer: '',
        target: '',
        type: '',
        shelf: '',
        calories: '',
        cups: '',
        weight: '',
        sugars: '',
        fat: '',
        sodium: '',
        protein: '',
        fiber: '',
        vitamins: '',
        health_score: '',
        quint_calories: '',
        quint_sugars: '',
        quint_fat: '',
        quint_protein: '',
        quint_fiber: '',
        quint_vitamins: '',
        quint_sodium: '',
        selected: false,
        ingredients: '',
        vegan: false,
        gluten: false,
        organic: false
      },
      ascii: 'Health Score[cereal] = \\sum_{cat}^{categories}Weight_{cat}*Normalize(cat,cereal) ',
      prompt: "We want to calculate the healthiest cereals for you based on your preferences. We will calculate a health score for each cereal based on the importance of the weight you assigned for each category and the cereal's nutrition data. Please answer the questions below."
    }
    this.handleSubmitQs = this.handleSubmitQs.bind(this);
    this.updateSelected = this.updateSelected.bind(this);
    this.getCereals = this.getCereals.bind(this);
  }

  componentDidMount() {

    const cerealList = CerealData.map((c, index) => {
      return {
        id: index,
        name: c.Name,
        manufacturer: c.Manufacturer,
        target: c.Target,
        type: c.Type,
        shelf: c.Shelf,
        calories: c.Calories,
        sugars: c.Sugars,
        fat: c.Fat,
        sodium: c.Sodium,
        protein: c.Protein,
        fiber: c.Fiber,
        cups: c.Cups,
        weight: c.Weight,
        vitamins: c.Vitamins,
        health_score: c['Health Score'],
        quint_calories: c.calories_norm,
        quint_sugars: c.sugars_norm,
        quint_fat: c.fat_norm,
        quint_protein: c.protein_norm,
        quint_fiber: c.fiber_norm,
        quint_vitamins: c.vitamins_norm,
        quint_sodium: c.sodium_norm,
        ingredients: c.Ingredients,
        vegan: c.Vegan,
        gluten: c['Gluten Free'],
        organic: c.Organic
      }
    })

    const questionList = [
      {
        label: "low calories",
        name: "calories"
      },
      {
        label: "low sugar",
        name: "sugar"
      },
      {
        label: "low fat",
        name: "fat"
      },
      {
        label: "low sodium",
        name: "sodium"
      },
      {
        label: "high protein",
        name: "protein"
      },
      {
        label: "high fiber",
        name: "fiber"
      },
      {
        label: "high vitamins",
        name: "vitamins"
      }
    ];

    const newState = Object.assign({}, this.state, {
      cereals: cerealList,
      questions: questionList
    });
    this.setState(newState);
  }

  getCereals() {
    let cereals = this.state.cereals;
    if(this.state.veganToggle || this.state.glutenToggle || this.state.organicToggle) {
      let newCereals = [];
      cereals.forEach(c => {
        if(c.vegan && this.state.veganToggle) {
          newCereals.push(c);
        } else if (c.gluten && this.state.glutenToggle) {
          newCereals.push(c);
        } else if (c.organic && this.state.organicToggle) {
          newCereals.push(c);
        }
      })
      // console.log(newCereals);
      return newCereals.slice();
    } else {
      return cereals.slice();
    }
  }

  updateSelected(selectedCereal) {
    // console.log(selectedCereal);
    
    const cerealsOneSelected = this.state.cereals.map(c => {
      if(selectedCereal.id === c.id) {
        return Object.assign({}, c, {selected: true})
      } else {
        return Object.assign({}, c, {selected: false})
      }
    });
    
    const newSelectedCereal = Object.assign({}, this.state, {
      selectedCereal: selectedCereal,
      cereals: cerealsOneSelected
    });
    this.setState(newSelectedCereal);
    // console.log(this.state.selectedCereal)
  }

  handleSubmitQs(importanceValues) {
    // console.log(importanceValues);
    // console.log(this.state.cereals);
    // assign gains
    let sum = 0;
    let gains = [];
    Object.values(importanceValues).forEach(v => sum = sum + v)
    if (sum === 0 ) {
      gains = [0,0,0,0,0,0,0]
    } else {
      Object.values(importanceValues).forEach(v => {
        if (v === 0) {
          gains.push(0);
        } else {
          gains.push(v/sum)
        }
      })
    }

    // console.log(gains)
    // console.log(this.state.gains);

    let newCerealList = this.state.cereals;

    // Recalculate health score

    newCerealList.forEach(c => {
      let newHealthScore = 0;
      newHealthScore += c.quint_calories*gains[0];
      newHealthScore += c.quint_sugars*gains[1];
      newHealthScore += c.quint_fat*gains[2];
      newHealthScore += c.quint_sodium*gains[3];
      newHealthScore += c.quint_protein*gains[4];
      newHealthScore += c.quint_fiber*gains[5];
      newHealthScore += c.quint_vitamins*gains[6];
      
      c.health_score = newHealthScore;
    })

    // console.log(newCerealList)

    let selectedCereal = this.state.selectedCereal;

    newCerealList.sort((a, b) => {
      if (a.selected) {
        selectedCereal = a;
      }
      if (b.selected) {
        selectedCereal = b;
      }

      if (a.health_score > b.health_score) {
        return -1;
      }
      if (a.health_score < b.health_score) {
        return 1;
      }
      return 0;
    })

    // assign to state
    const newState = Object.assign({}, this.state, {
      cereals: newCerealList,
      selectedCereal: selectedCereal,
      gains: gains
    }) 
    this.setState(newState, () => {console.log(this.state)});
  }

  render() {
    return (
      <div className="App">
        
        <header className="App-header">
          <h2 className="App-title">Your Healthy Cereals</h2>
          <br></br>
        </header>
        <div className="body">
          <div className="survey-and-scatter">
            <div className="survey">
              <p className="prompt">{this.state.prompt}</p>
                <div className="weights-label">Weight</div>
                <div className="questions-container">
                  <Questions className="questions"
                              onSubmitQs={this.handleSubmitQs} 
                              questions={this.state.questions} 
                              gains={this.state.gains}
                              sliderColors={this.state.pieChartColors}/>
                </div>              
              <div>
                <br></br>
                <h3> Health Score Calculation</h3>
                <div>
                  For the undesirable categories [Sugar, Fats, Calories and Sodium], we reverse the values in that category by getting the maximum value in that category then doing (maximum - value) for all values.
                </div>
                <div>
                <div className="health-score-formula-label">
                  To calculate the health score of each cereal:
                </div>
                <div>
                    <MathJax.Context input='tex'>
                        <div>
                            <MathJax.Node>{this.state.ascii}</MathJax.Node>
                        </div>
                    </MathJax.Context>
                </div>
                <text>
                  After reversing the undesirable category lists: <br></br>
                  1. For each category, we normalize all values to 0 - 100. <br></br>
                  2. Then for each cereal, we calculate the health score by adding up each cereal's category value times that category's specified weight.

                </text>
                </div>
              </div>
            </div>
            <div className="scatters">
              <div className="scatters-label">Raw Data: Cereal categories</div>
              <div className="toggle-button-container">
                <div className="toggle-label">Show scatterplots</div>
                <ToggleButton
                value={ this.state.showScatter || false }
                onToggle={(value) => {
                  this.setState({
                    showScatter: !this.state.showScatter,
                  })
                }} />
              </div>
              {this.state.showScatter &&
              <div>
                Hover over dots to view cereal name
                <div className="scatter-and-label">
                  <div className="scatter-label">Calories in Cereal (cal)</div>
                  <SimpleScatterChart cereals={this.getCereals()} category="calories"/>
                </div>
                <div className="scatter-and-label">
                  <div className="scatter-label">Sugar in Cereal (g)</div>
                  <SimpleScatterChart cereals={this.getCereals()} category="sugars"/>
                </div>
                <div className="scatter-and-label">
                  <div className="scatter-label">Fat in Cereal (g)</div>
                  <SimpleScatterChart cereals={this.getCereals()} category="fat"/>
                </div>
                <div className="scatter-and-label">
                  <div className="scatter-label">Sodium in Cereal (mg)</div>
                  <SimpleScatterChart cereals={this.getCereals()} category="sodium"/>
                </div>
                <div className="scatter-and-label">
                  <div className="scatter-label">Protein in Cereal (g)</div>
                  <SimpleScatterChart cereals={this.getCereals()} category="protein"/>
                </div>
                <div className="scatter-and-label">
                  <div className="scatter-label">Fiber in Cereal (g)</div>
                  <SimpleScatterChart cereals={this.getCereals()} category="fiber"/>
                </div>
                <div className="scatter-and-label">
                  <div className="scatter-label">Vitamins in Cereal (%)</div>
                  <SimpleScatterChart cereals={this.getCereals()} category="vitamins"/>
                </div>
              </div>
              }
            </div>
          </div>
            <div className="pie-chart-container">
              <div className="pie-and-selected">
                <div className="pie-and-title">
                  <div className="pie-title">Weights of Each Category</div>
                  <SimplePieChart data={[
                      {
                        color: this.state.pieChartColors[0],
                        title: 'Low calories',
                        value: Math.round((this.state.gains[0]*100*100)/100),
                        index: 0
                      },
                      {
                        color: this.state.pieChartColors[1],
                        title: 'Low sugar',
                        value: Math.round((this.state.gains[1]*100*100)/100)
                      },
                      {
                        color: this.state.pieChartColors[2],
                        title: 'Low fat',
                        value: Math.round((this.state.gains[2]*100*100)/100),
                      },
                      {
                        color: this.state.pieChartColors[3],
                        title: 'Low sodium',
                        value: Math.round((this.state.gains[3]*100*100)/100)
                      },
                      {
                        color: this.state.pieChartColors[4],
                        title: 'High protein',
                        value: Math.round((this.state.gains[4]*100*100)/100)
                      },
                      {
                        color: this.state.pieChartColors[5],
                        title: 'High fiber',
                        value: Math.round((this.state.gains[5]*100*100)/100)
                      },
                      {
                        color: this.state.pieChartColors[6],
                        title: 'High vitamins',
                        value: Math.round((this.state.gains[6]*100*100)/100)
                      }
                    ]}/>
                  </div>
                  <SelectedCereal selectedCereal={this.state.selectedCereal}/>   

              </div>

            </div>
            <div className="toggles-and-bar">
              <div className="toggles">
                
                <div className="toggle-button-container">
                  <div className="toggle-label">Show vegan</div>
                  <ToggleButton
                  value={ this.state.veganToggle || false }
                  onToggle={(value) => {
                    this.setState({
                      veganToggle: !this.state.veganToggle,
                    })
                  }} />
                </div>
                <div className="toggle-button-container">
                  <div className="toggle-label">Show gluten free</div>
                  <ToggleButton
                  value={ this.state.glutenToggle || false }
                  onToggle={(value) => {
                    this.setState({
                      glutenToggle: !this.state.glutenToggle,
                    })
                  }} />
                </div>
                <div className="toggle-button-container">
                  <div className="toggle-label">Show organic</div>
                  <ToggleButton
                  value={ this.state.organicToggle || false }
                  onToggle={(value) => {
                    this.setState({
                      organicToggle: !this.state.organicToggle,
                    })
                  }} />
                </div>

              </div>
              <h6> Click on any bar to view nutritional overview for specific cereal. </h6>
              <div className="bar-chart">
                <BarChart updateSelected={this.updateSelected} selected={this.state.selectedCereal} cereals={this.getCereals()}/> 
              </div>

            </div>
            
            
          {/* <div className="cereal-list">
            <CerealList cereals={this.state.cereals} />    
          </div>     */}
        </div>
      </div>
    );
  }
}

export default App;
