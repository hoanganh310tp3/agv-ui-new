//from 0 to 2
export const startPoints = Array.from({ length: 3 }, (_, index) => index);

//from 10 to 15
export const endPoints = Array.from({ length: 3 }, (_, index) => index + 17);

export const loadNames = ["stone", "wood", "iron"];

export const agvIDs = Array.from({ length: 4 }, (_, index) =>
  (index + 1).toString(),
);

export const guidanceTypes = ["Line Following", "Computer Vision"];

// Ensure loadNames is treated as a tuple with at least one string for enum validation in forms
export const loadNamesEnum = loadNames as [string, ...string[]];