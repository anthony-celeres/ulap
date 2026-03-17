# Responsive Weather Dashboard Laboratory Guide

---

## I. Introduction

Modern web applications are expected to be dynamic, responsive, and highly interactive. Unlike traditional static websites, dynamic web applications retrieve and display real-time data, respond to user input without full-page reloads, and provide consistent experiences across multiple devices and browsers. In this laboratory activity, students will design and develop a Responsive Weather Dashboard that integrates a third-party API to display real-time weather data. Using a modern frontend framework such as React, Angular, or Vue.js, students will apply component-based architecture, responsive design principles, API integration, cross-browser testing, and performance optimization techniques. The project simulates a real-world development task where students act as junior web developers building a production-ready application that must: Display live weather information Work on mobile, tablet, and desktop Load efficiently Function consistently across browsers This activity bridges conceptual understanding (static vs. dynamic applications) with applied frontend engineering skills.

## II. Learning Outcomes

By the end of this laboratory activity, students will be able to:

1. Differentiate static and dynamic web applications based on functionality, data flow, and user interaction.
2. Develop a component-based web application using a modern frontend framework (React, Angular, or Vue.js).
3. Implement responsive design principles using CSS Flexbox/Grid and media queries to support multiple screen sizes.
4. Integrate and manage a third-party API securely, including API key handling, error management, and loading states.
5. Apply performance optimization techniques to improve application efficiency and user experience.

## III. Required Materials and Tools

### Software Requirements

- Code Editor (VS Code recommended)
- Node.js (LTS version)
- Modern Web Browser: Google Chrome, Mozilla Firefox, Microsoft Edge, or Safari

### Framework (Choose One)

- React
- Angular
- Vue.js

### API Service

- OpenWeatherMap (or equivalent public weather API)

### Additional Tools

- Git & GitHub account
- Browser Developer Tools
- Internet connection

## IV. Laboratory Procedure

### Part 1: Static vs Dynamic Application

#### Step 1: Create Static Version

Students will:

- Create static.html
- Hardcode weather data
- Apply CSS styling
- Avoid JavaScript or API usage

**Deliverables**: static.html

**Explanation**: 1-2 paragraph explanation:
- Why is it static?
- What are its limitations?

#### Step 2: Convert to Dynamic

Students will:

- Add JavaScript
- Use fetch() or Axios
- Retrieve live weather data
- Dynamically update the DOM

**Must implement**:
- Loading state
- Error handling
- User input for city

**Deliverables**: dynamic.html or framework app

**Reflection**: Short reflection explaining what makes it dynamic

### Part 2: Framework Implementation

Students must choose ONE framework: React, Angular, or Vue.js

**Requirements**:

1. Component-based architecture
2. Search input for city
3. Display: Temperature, Weather condition, and Weather icon
4. Proper state management
5. Organized file structure

**Deliverables**:
- GitHub repository link
- Screenshot of working application

### Part 3: Responsive Design Challenge

Students must:

- Use CSS Flexbox or Grid
- Implement at least 2 media queries
- Ensure layout adapts: DeviceLayout BehaviorMobile Vertical stacking Tablet Adjusted spacing Desktop Expanded multi-column layout

**Cross-Browser Testing**:

Test application on: Chrome, Firefox, Edge or Safari

**Submit screenshots from at least two browsers**.

### Part 4: API Integration Requirements

Students must:

1. Register for an API key
2. Review API documentation
3. Implement:
   - API key usage and
   - Secure storage (environment variable for frameworks)
4. Handle:
   - Invalid city input
   - Network failure
   - Loading spinner

### Part 5: Performance Optimization Tasks

Implement at least THREE of the following:

- Minify CSS/JS
- Lazy load weather icons
- Optimize images
- Use async/defer
- Implement caching via localStorage
- Use a CDN

**Additionally**:

- Implement dark/light theme toggle
- Add 5-day forecast feature

## V. Grading Rubric (100 Marks)

| Criteria | Excellent (A) | Good (B) | Satisfactory (C) | Poor (D/F) | Marks |
| --- | --- | --- | --- | --- | --- |
| Static vs Dynamic (10) | Clear, analytical comparison | Minor gaps | Basic understanding | Incorrect /10 |
| Framework Implementation (20) | Clean structure, proper state | Mostly structured | Basic app works | Disorganized/errors /20 |
| API Integration (20) | Fully functional, error-handled | Minor issues | Basic call works | Broken/insecure /20 |
| Responsive Design (15) | Fully responsive | Minor issues | Basic responsiveness | Not responsive /15 |
| Cross-Browser (10) | Tested & documented | Limited testing | Minimal testing | None /10 |
| Performance Optimization (15) | 3+ techniques applied | 2 techniques | 1 technique | None /15 |
| Code Quality (5) | Clean & modular | Mostly clean | Some clutter | Poor structure /5 |
| Report & Reflection (5) | Insightful & analytical | Adequate | Basic summary | Minimal /5 |
| **Total** | **100 Marks** | | | | |

## VI. Reflection Questions

Students must answer the following:

1. Why did you choose your framework?
2. What was the most challenging part of API integration?
3. How did responsive design improve usability?
4. Which optimization had the greatest performance impact?

## VII. Expected Learning Impact

By the end of this laboratory activity, students will have:

- Built a complete dynamic web application
- Applied component-based frontend architecture
- Integrated real-world APIs securely
- Practiced responsive and cross-browser testing
- Implemented performance improvements
- Strengthened debugging and optimization skills

This activity simulates real-world frontend development workflows and prepares students for industry-level web engineering tasks.

## VIII. References

- OpenWeather Ltd. (2024). OpenWeatherMap API documentation. https://openweathermap.org/api
- React Team. (2024). React documentation. https://react.dev
- Angular Team. (2024). Angular documentation. https://angular.io
- Vue.js Team. (2024). Vue.js guide. https://vuejs.org
- Mozilla Foundation. (2024). MDN Web Docs: Responsive design. https://developer.mozilla.org