import ast

def _get_globals(filename):
    _local_globals = dict()
    _local_globals['rule'] = lambda *args, **kwargs: rule(*args, **kwargs)
    _local_globals['load'] = lambda *args, **kwargs: load(_local_globals, *args, **kwargs)
    _local_globals['genrule'] = lambda *args, **kwargs: genrule(filename, *args, **kwargs)

    return _local_globals

def parse_build(filename, context):
    with open(filename) as f:
        src = f.read()

    tree = ast.parse(src, filename)
    code = compile(tree, filename, 'exec')
    exec(code, context)

context_cache = {}
def load_def(filename):
    if filename in context_cache:
        return context_cache[filename]

    context_cache[filename] = context = _get_globals(filename)
    parse_build(filename, context)

    return context

def load(outer_context, filename, *args):
    context = load_def(filename)
    for rule in args:
        outer_context[rule] = context[rule]

class Rule(object):
    def __init__(self, name, implementation=None, attrs={}, *args, **kwargs):
        self.name = name
        self.implementation = implementation
        self.attrs = attrs

rules = []
def register(implementation, attrs, name=None, **kwargs):
    rules.append(Rule(name, implementation, attrs))
    print("registered %s" % name)

def rule(implementation=None, attrs={}):
    return lambda *args, **kwargs: register(implementation, attrs, *args, **kwargs)

def genrule(name = None, srcs=[], outs=[], cmd=None):
    print({
        "name": name,
        "srcs": srcs,
        "outs": outs,
        "cmd": cmd
    })

build_file = 'BUILD.lets'
defs_file = 'echo.lets_def'

parse_build(build_file, _get_globals(defs_file))
print rules
for rule in rules:
    rule.implementation(None)
# print(_globals)
