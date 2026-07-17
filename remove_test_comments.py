import re

def remove_comments_from_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Remove single-line comments (// ...) but not inside strings
    lines = content.split('\n')
    result = []
    in_string = False
    string_char = None

    for line in lines:
        new_line = ''
        i = 0
        while i < len(line):
            char = line[i]
            if not in_string and char in ('"', "'") and (i == 0 or line[i-1] != '\\'):
                in_string = True
                string_char = char
                new_line += char
            elif in_string and char == string_char and (i == 0 or line[i-1] != '\\'):
                in_string = False
                string_char = None
                new_line += char
            elif not in_string and i + 1 < len(line) and char == '/' and line[i+1] == '/':
                break
            else:
                new_line += char
            i += 1
        result.append(new_line.rstrip())

    new_content = '\n'.join(result)
    with open(filepath, 'w') as f:
        f.write(new_content)

# Process test files
import os

test_dir = 'C:/Users/Elijah (AI)/Downloads/Github Projects/Simple'
for filename in os.listdir(test_dir):
    if filename.endswith('.mjs') or filename.endswith('.cjs') or filename.endswith('.js'):
        if filename.startswith('test_') or filename.startswith('test-') or filename == 'test_lex.js':
            filepath = os.path.join(test_dir, filename)
            remove_comments_from_file(filepath)
            print(f'Processed {filename}')

print('Done test files')