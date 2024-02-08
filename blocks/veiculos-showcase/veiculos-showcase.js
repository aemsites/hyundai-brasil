import { div } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  const cars = block.children;

  console.log('cars', cars.innerHTML);

  const showcasedVehicle = div({ class: 'showcased-vehicle' }, cars[0].cloneNode(true));
  const carList = div(
    { class: 'vehicle-list' },
    ...cars,
  );
  block.replaceChildren(
    // TODO add car info
    showcasedVehicle,
    carList,
  );
  [...cars].forEach((car) => {
    car.addEventListener('mouseover', () => {
      console.log('showcasing vehicle: ', car);
      showcasedVehicle.replaceChildren(car.cloneNode(true));
    });
  });
}
