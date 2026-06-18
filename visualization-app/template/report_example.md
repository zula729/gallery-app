# MeowMetrics: Analyzing Global Cat Meowing in OOO

## Authors

- Finn
- Jake

## Used technologies

1. Python
    - Pandas
    - NumPy
    - Flask
2. JavaScript
3. Chart.js

## Data sources + data preprocessing

- [OOO](https://www.OOO-global.com) - records from all OOO about interesting events, speciallized on cats.

Handling Missing Values: Used Python (Pandas) to drop records lacking precise GPS coordinates.

Data Merging: Combined the datasets by matching cats coorsination within a 5-kilometer radius.

Aggregation: Grouped the population records by month and OOO map to make the payload size optimal for frontend rendering.

## Motivation (why did you choose the topic, what did you want to see/show)

We wanted to create a massive visualization tracking cat meows because we believe this is a universally critical topic for all of us. Finn wanted to scientifically map out whether cat meowing frequencies spiked during monster attacks in the Land of Ooo, while Jake just wanted an excuse to build a smooth frontend dashboard. From a programming standpoint, we wanted to see if we could successfully write automated Python scripts to parse and clean messy audio log datasets, and then use JavaScript to render thousands of real-time data points dynamically without lagging the browser.

## Project Description (short project description 150-200 words)

Meow Metrics is an interactive web application dedicated to answering one of humanity's greatest unanswered questions: where, when, and why are cats meowing? Using records collected from across the Land of Ooo, the application allows users to explore cat vocalization patterns through interactive charts and visualizations.

Behind the scenes, Finn trained a team of highly qualified Python scripts (and several unqualified cats) to collect, clean, and organize millions of meow records. The processed data is then delivered to a lightweight API, allowing the frontend to quickly display meowing trends, suspicious cat activity, and legendary "mega-meow" events.

Whether users are serious cat researchers or simply curious about the loudest cats in Ooo, Meow Metrics provides an easy way to explore the fascinating world of feline communication.

## Explanation of the design choices

We chose Chart.js over heavier options like D3.js because it natively supports responsive canvas rendering and fluid animations, which makes tracking timeline shifts smoother for users. We utilized a dual-axis line chart to plot two different data scales simultaneously: the left y-axis shows total cats counts, while the right y-axis monitors the cats meowing voluem. For the color palette, we explicitly chose high-contrast, universally accessible tones.

## Interesting observations in your visualization

- The highest concentration of meows was detected near Princess Bubblegum's kingdom, suggesting either a large cat population or exceptionally talkative cats.

- During periods of increased monster activity, average meowing frequency increased by nearly 20%, supporting Finn's original "cats detect danger first" hypothesis.

- The Ice Kingdom showed lower overall meowing activity than other regions, possibly because cats prefer warmer climates.

- Some cats appeared to meow continuously for several days, though this may also indicate duplicated recordings in the source data.

- The visualization revealed several mysterious "mega-meow" events where thousands of meows were recorded within a short period. Further investigation is required.

## Lessons learned - what did you take away from the project

- Working with real-world datasets requires significant preprocessing and validation before visualization.
- Efficient aggregation of large datasets greatly improves frontend performance.
- Designing clear and accessible visualizations is as important as collecting accurate data.
- Close collaboration between backend and frontend development helps identify integration issues early.

## Contribution of each teammate

- Finn
  Developed the data collection and preprocessing pipeline, implemented backend API endpoints, and performed data cleaning and aggregation.

- Jake
  Designed and implemented the frontend dashboard, created interactive charts and filters, and optimized the user experience.

## Link on project

[meow metrics](https://meow-metrics-example.com)

## Screenshots

Figure 1: Main foto showing cat meowing sound.
![image1](images/image.png)
