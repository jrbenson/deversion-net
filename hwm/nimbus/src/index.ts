import './index.css'
import { StarChart } from './starchart'

const elem = document.querySelector('#map') as HTMLElement
if (elem) {
  const starChart = new StarChart(elem)
}
