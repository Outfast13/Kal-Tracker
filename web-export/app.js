const state = {
  calories: 1420,
  protein: 88,
  carbs: 140,
  fat: 52
};

const caloriesEl = document.getElementById('calories');
const proteinEl = document.getElementById('protein');
const carbsEl = document.getElementById('carbs');
const fatEl = document.getElementById('fat');

function render() {
  caloriesEl.textContent = `${state.calories} kcal`;
  proteinEl.textContent = `${state.protein}g`;
  carbsEl.textContent = `${state.carbs}g`;
  fatEl.textContent = `${state.fat}g`;
}

document.getElementById('addFood').addEventListener('click', () => {
  state.calories += 120;
  state.carbs += 15;
  render();
});

document.getElementById('addWorkout').addEventListener('click', () => {
  state.calories = Math.max(0, state.calories - 75);
  render();
});

render();
