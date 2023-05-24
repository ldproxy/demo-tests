module.exports = {
  bumpDeps: true,
  publish: false,
  push: false,
  groups: [
    {
      name: "demo-tests",
      include: ["", "filter-queries"]
    }
  ],
  changelog: {
    groups: [{
      masterPackageName: "demo-tests",
      changelogPath: ".",
      include: [".", "filter-queries"]
    }],
    customRenderers: {
      renderEntry: (entry) => `- ${entry.comment}`,
    }
  },
}

