def remove_jsx_comments(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Remove JSX comments {/* ... */}
    import re
    content = re.sub(r'\{/\*.*?\*/\}', '', content, flags=re.DOTALL)

    with open(filepath, 'w') as f:
        f.write(content)

remove_jsx_comments('C:/Users/Elijah (AI)/Downloads/Github Projects/Simple/src/app/page.tsx')
print('Done JSX comments')