const NPM_CREATE = [
	"npm pkg set serenityjs=latest",
	"npm pkg set private=true",
	"npm pkg set name=serenityjs",
	"npm pkg set version=1.0.0",
	'npm pkg set workspaces[0]="plugins/*"',
	'npm pkg set scripts.start="serenity start --ts"'
];

export { NPM_CREATE };
