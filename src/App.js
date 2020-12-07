import React from 'react';
import './App.css';
import na_logo from './img/NA.png';
import hr_logo from './img/heavyrain.png';
import nr_logo from './img/normalrain.jpg';
import sunny_logo from './img/sunny.png';
import cloudy_logo from './img/cloudy.png';
import Select from 'react-select'

export default class Page extends React.Component {
  state = {
    city: [{ id: 1, name: "London", interval: 30000, icon: na_logo, degree: 0.0, type: 'NA', intervalclass: [],isHover:false },
    { id: 2, name: "New York", interval: 10000, icon: na_logo, degree: 0.0, type: 'NA', intervalclass: [],isHover:false }],
    appId: '29427ce64d03b7ac2c07796a328c0389',
    options: [{ value: '15000', label: '15' }, { value: '30000', label: '30' },
    { value: '45000', label: '45' }],
    newcityname: '',
    newinterval: ''
  };

  constructor(props) {
    super(props);
    console.log('constructor')
    for (var i = 0; i < this.state.city.length; i++)
      window.clearInterval(this.state.city[i].intervalclass);
  }

  async componentDidMount() {
    for (var i = 0; i < this.state.city.length; i++) {
      var interval = this.state.city[i].interval
      var name = this.state.city[i].name
      var id = this.state.city[i].id
      var intervalId = setInterval(this.timer, interval, id, name, this.state.appId, this);
      this.state.city[i].intervalclass = intervalId;
    }
  }

  componentWillUnmount() {
    for (var i = 0; i < this.state.city.length; i++)
      window.clearInterval(this.state.city[i].intervalclass);
  }

  addNewCity(page) {
    var cityname = page.state.newcityname;
    var interval = page.state.newinterval;
    if(cityname != '' && interval != ''){
      var foundIndex = page.state.city.findIndex(x => x.name == cityname);
      if(foundIndex >= 0){
        return;
      }
      var city = page.state.city;
      var max = Math.max.apply(Math, city.map(function(o) { return o.id; }));
      var new_id = (max + 1);
      city.push({ id: new_id, name: cityname, interval: interval, icon: na_logo, degree: 0.0, type: 'NA', intervalclass: [],isHover:false });
      var intervalId = setInterval(this.timer, interval, new_id, cityname, this.state.appId, this);
      var foundIndex = page.state.city.findIndex(x => x.id == new_id);
      city[foundIndex].intervalclass = intervalId;
    }
  }

  timer(id, cityname, appID, page) {
    try{
    fetch("https://api.openweathermap.org/data/2.5/weather?q=" + cityname + "&appid=" + appID)
      .then(res => res.json())
      .then(
        (result) => {
          var foundIndex = page.state.city.findIndex(x => x.id == id);
          console.log(result)

          page.state.city[foundIndex].degree = result.main.temp;
          var type = result.weather[0].main;
          page.state.city[foundIndex].type = type;
          switch (type.toUpperCase()) {
            case "FOG":
            case "CLOUDS":
              page.state.city[foundIndex].icon = cloudy_logo;
              break;
            case "RAIN":
              page.state.city[foundIndex].icon = nr_logo;
              break;
            case "HEAVYRAIN":
              page.state.city[foundIndex].icon = hr_logo;
              break;
            case "CLEAR":
            case "SUNNY":
              page.state.city[foundIndex].icon = sunny_logo;
              break;
            default:
              page.state.city[foundIndex].icon = na_logo;
              break;
          }
          page.setState({ state: page.state });
        },
        (error) => {
          console.log(error)
        }
      )
    }catch(ex){
      console.log(ex);
    }
  }

  setHover(id, value, page){
    var foundIndex = page.state.city.findIndex(x => x.id == id);
    var city = page.state.city;
    city[foundIndex].isHover = value;
    page.setState({city:city});
  }
  removeCity(id, page){
    var foundIndex = page.state.city.findIndex(x => x.id == id);
    var city = page.state.city;
    window.clearInterval(this.state.city[foundIndex].intervalclass);
    city.splice(foundIndex, 1);
    page.setState({city:city});
  }

  render() {
    const { city } = this.state;
    return (
        <div>
          <div className="topContainer">
            {city.map((b) => (
              <div key={b.id} onClick={() => this.removeCity(b.id, this)}
              onMouseEnter={() => this.setHover(b.id,true,this)} onMouseLeave={() => this.setHover(b.id,false,this)}>
                <ul style={{ listStyle: 'none' }}>
                  <li>
                    <p style={{ textAlign: 'left' }}>{b.name}</p>
                  </li>
                  <li>
                    <div className="center">
                      <img style={{ width: 150, height: 150}} src={b.icon} />
                    </div>
                  </li>
                  <li>
                    <div className='topContainer'>
                      <p style={{ textAlign: 'left', width: '50%' }}>{b.degree} &#8457;</p>
                      <p style={{ textAlign: 'right', width: '50%' }}>{b.type}</p>
                    </div>

                  </li>
                  <li style={{textAlign:'center',display:b.isHover?'block':'none'}}>
                    <button>Remove</button>
                  </li>
                </ul>
              </div>
            ))}

          </div>
          <div style={{ width: '100%' }}>
            <p style={{ textAlign: 'center' }}>Enter City</p>
            <div style={{ width: '50%', margin: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <input type="text" style={{ margin: 'auto' }} onChange={(val)=> {this.state.newcityname = val.target.value;}}/>
                <div style={{ width: '150px' }}>
                  <Select options={this.state.options} onChange={(val)=> {this.state.newinterval = val.value;}}
                  isSearchable={false}/>
                </div>
                <div style={{ margin: 'auto' }}>
                  <button onClick={() => this.addNewCity(this)}>
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
  };
};

