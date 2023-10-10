import './index.css'
import './map.css'
import { StarChart } from './starchart'

const elem = document.querySelector('#map') as HTMLElement
if (elem) {
  const starChart = new StarChart(elem)
}
