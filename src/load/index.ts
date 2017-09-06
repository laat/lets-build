/*
First, we load and evaluate all extensions and all BUILD files that are needed
for the build. The execution of the BUILD files simply instantiates rules (each
time a rule is called, it gets added to a graph). This is where macros are
evaluated.
*/

import loadRules from './load-rules';

// TODO(laat): construct DAG
