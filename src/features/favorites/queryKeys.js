export const favoriteKeys = {
  all: ["favorites"],
  user: (uid) => [...favoriteKeys.all, "user", uid],
  userEvents: (uid) => [...favoriteKeys.all, "userEvents", uid],
};
