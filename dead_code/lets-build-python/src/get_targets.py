

def get_targets(filename):
    with open(filename) as f:
        src = f.read()

    tree = ast.parse(src, filename)
    load = []
    rules = {}

    for i, node in enumerate(ast.iter_child_nodes(tree)):
        if (not isinstance(node, ast.Expr) or not isinstance(node.value, ast.Call)):
            raise SyntaxError('BUILD files must only have call expressions', (filename, node.lineno, node.col_offset, src.splitlines()[node.lineno]))
            continue

        name = node.value.func.id
        if (name == 'load'):
            load.append(node)
            continue

        print(node)
        print(isinstance(node, ast.Expr))
        print(isinstance(node.value, ast.Call))
        print([ (k.arg, k.value.s) for k in node.value.keywords])

    print (load, rules)
