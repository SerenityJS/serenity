// Yarn changes all the cwds to the workspace being executed or the project root.
// In some cases I want to know what workspace project is executing another workspace project.

// Because of the way plugins work this will run multiple times so the last one will be considered
// the exec cwd. This is perfect for my use case so consider it a feature.
module.exports = {
	name: "fix-workspaces",
	factory: () => ({
		hooks: {
			setupScriptEnvironment(_, scriptEnvironment) {
				scriptEnvironment.EXEC_CWD = process.cwd();
			}
		}
	})
};
