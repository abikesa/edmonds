'use strict';

var scenarioVector = [1, 0, 0, 0, 0]; // Default to excellent self-rated health scenario

function selectScenario(scenario) {
  switch (scenario) {
    case 'excellent':
      scenarioVector = [1, 0, 0, 0, 0];
      break;
    case 'verygood':
      scenarioVector = [0, 1, 0, 0, 0];
      break;
    case 'good':
      scenarioVector = [0, 0, 1, 0, 0];
      break;
    case 'fair':
      scenarioVector = [0, 0, 0, 1, 0];
      break;
    case 'poor':
      scenarioVector = [0, 0, 0, 0, 1];
      break;
    default:
      scenarioVector = [0, 0, 1, 0, 0]; // Set default to 'good'
  }
  calculateMortalityRisk(scenario); // Pass selected scenario to calculateMortalityRisk
}

function calculateMortalityRisk(scenario) {
  const beta = [0, .29266961, .63127178, 1.0919233, 2.010895]; // Beta coefficients for excellent, very good, good, fair, poor
  const s0 = [.9999999, .96281503, .91558171, .87179276, .82403985]; // Survival probabilities at timepoints 0, 5, 10, 15, 20
  const timePoints = [0, 5, 10, 15, 20];
  const logHR = beta.reduce((acc, curr, index) => acc + (curr * scenarioVector[index]), 0);
  const f0 = s0.map(s => (1 - s) * 100);
  const f1 = f0.map((f, index) => f * Math.exp(logHR));

  const colorSchemes = {
    'excellent': 'rgba(0, 191, 255, 1)', // Bright blue
    'verygood': 'rgba(255, 0, 255, 1)', // Magenta
    'good': 'rgba(106, 168, 79, 1)', // Cabbage green
    'fair': 'rgba(255, 218, 185, 1)', // Peach orange
    'poor': 'rgba(128, 0, 128, 1)' // Purple
};

  const riskResults = timePoints.map((time, index) => `Risk at ${time} years: ${f1[index].toFixed(2)}%`);

  // Clear existing chart before creating a new one
  if (window.mortalityChart) {
    window.mortalityChart.destroy();
  }

  // Draw graph
  const ctx = document.getElementById('mortality-risk-graph').getContext('2d');
  window.mortalityChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: timePoints.map(String),
      datasets: [{
        label: 'Mortality Risk',
        data: f1,
        stepped: true, // Step-wise line
        borderColor: colorSchemes[scenario],
        backgroundColor: colorSchemes[scenario].replace('1)', '0.2)'),
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Timepoints (years)'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Mortality Risk (%)'
          },
          suggestedMin: 0,
          suggestedMax: 80,
          stepSize: 20,
          fontSize: 14
        }
      }
    }
  });

  document.getElementById("mortality-risk-results").innerText = riskResults.join('\n');
}

// Attach event listener to the dropdown to update the scenarioVector
document.getElementById("scenario-dropdown").addEventListener("change", function() {
  selectScenario(this.value);
});
