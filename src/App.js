import React, { Component } from 'react'
import api from './services/api'
import './materialize.css'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: []
    }
  }

  async componentDidMount() {
    try {
      const res = await api.get('/')
      console.log(res)
      this.setState({
        data: res.data
      })
    } catch (err) {
      console.log(err)
    }
  }

  render() {
    const { data } = this.state
    return (
      <div class="container">
        {data.map(x => (
          <div className="card-panel teal">
            <span className="white-text">{x}</span>
          </div>
        ))}
      </div>
    )
  }
}

export default App
