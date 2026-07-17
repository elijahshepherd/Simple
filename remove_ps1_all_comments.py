def remove_ps1_comments_everywhere(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Remove PowerShell comments (# ...) everywhere, including inside heredocs
    # But not inside strings
    lines = content.split('\n')
    result = []
    
    for line in lines:
        new_line = ''
        i = 0
        in_string = False
        string_char = None
        
        while i < len(line):
            char = line[i]
            
            # Handle string start/end
            if not in_string and char in ('"', "'") and (i == 0 or line[i-1] != '`'):
                in_string = True
                string_char = char
                new_line += char
            elif in_string and char == string_char and (i == 0 or line[i-1] != '`'):
                in_string = False
                string_char = None
                new_line += char
            # Handle comment
            elif not in_string and char == '#':
                break
            else:
                new_line += char
            i += 1
        
        result.append(new_line.rstrip())

    new_content = '\n'.join(result)
    with open(filepath, 'w') as f:
        f.write(new_content)

# Also remove C# comments from the C# TypeDefinition strings in the file
def remove_cs_comments_everywhere(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Remove C# comments (// ... and /* ... */) everywhere
    lines = content.split('\n')
    result = []
    
    for line in lines:
        new_line = ''
        i = 0
        in_string = False
        string_char = None
        
        while i < len(line):
            char = line[i]
            
            # Handle string start/end
            if not in_string and char in ('"', "'") and (i == 0 or line[i-1] != '\\'):
                in_string = True
                string_char = char
                new_line += char
            elif in_string and char == string_char and (i == 0 or line[i-1] != '\\'):
                in_string = False
                string_char = None
                new_line += char
            # Handle // comment
            elif not in_string and i + 1 < len(line) and char == '/' and line[i+1] == '/':
                break
            # Handle /* comment */
            elif not in_string and i + 1 < len(line) and char == '/' and line[i+1] == '*':
                # Skip until */
                i += 2
                while i + 1 < len(line) and not (line[i] == '*' and line[i+1] == '/'):
                    i += 1
                if i + 1 < len(line):
                    i += 2  # skip */
                continue
            else:
                new_line += char
            i += 1
        
        result.append(new_line.rstrip())

    new_content = '\n'.join(result)
    with open(filepath, 'w') as f:
        f.write(new_content)

remove_ps1_comments_everywhere('C:/Users/Elijah (AI)/Downloads/Github Projects/Simple/installer/install.ps1')
remove_cs_comments_everywhere('C:/Users/Elijah (AI)/Downloads/Github Projects/Simple/installer/install.ps1')
print('Done install.ps1 with all comments removed')