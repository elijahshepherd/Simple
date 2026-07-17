import re

def remove_ps1_comments(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Remove single-line comments (# ...) but not inside strings or heredocs
    lines = content.split('\n')
    result = []
    in_string = False
    string_char = None
    in_heredoc = False

    for line in lines:
        new_line = ''
        i = 0
        while i < len(line):
            char = line[i]
            if not in_string and not in_heredoc and char in ('"', "'") and (i == 0 or line[i-1] != '`'):
                in_string = True
                string_char = char
                new_line += char
            elif in_string and char == string_char and (i == 0 or line[i-1] != '`'):
                in_string = False
                string_char = None
                new_line += char
            elif not in_string and not in_heredoc and i + 1 < len(line) and char == '@' and line[i+1] == '"':
                in_heredoc = True
                new_line += '@"'
                i += 2
                continue
            elif in_heredoc and char == '"' and (i == 0 or line[i-1] != '`') and i + 1 < len(line) and line[i+1] == '@':
                in_heredoc = False
                new_line += '"@'
                i += 2
                continue
            elif not in_string and not in_heredoc and char == '#':
                break
            else:
                new_line += char
            i += 1
        result.append(new_line.rstrip())

    new_content = '\n'.join(result)
    with open(filepath, 'w') as f:
        f.write(new_content)

# Also remove comments inside the heredoc (the uninstaller script)
def remove_ps1_heredoc_comments(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Find heredoc sections and remove comments inside them
    # Pattern: @" ... "@
    def clean_heredoc(match):
        heredoc = match.group(0)
        lines = heredoc.split('\n')
        result = []
        for line in lines:
            # Remove # comments but keep the line
            if '#' in line and not line.strip().startswith('#'):
                # Find # that's not in a string
                in_str = False
                str_char = None
                for i, c in enumerate(line):
                    if not in_str and c in ('"', "'") and (i == 0 or line[i-1] != '`'):
                        in_str = True
                        str_char = c
                    elif in_str and c == str_char and (i == 0 or line[i-1] != '`'):
                        in_str = False
                        str_char = None
                    elif not in_str and c == '#':
                        line = line[:i].rstrip()
                        break
            result.append(line)
        return '\n'.join(result)

    # Apply to heredocs
    import re
    new_content = re.sub(r'@".*?"@', clean_heredoc, content, flags=re.DOTALL)
    
    with open(filepath, 'w') as f:
        f.write(new_content)

remove_ps1_comments('C:/Users/Elijah (AI)/Downloads/Github Projects/Simple/installer/install.ps1')
remove_ps1_heredoc_comments('C:/Users/Elijah (AI)/Downloads/Github Projects/Simple/installer/install.ps1')
print('Done install.ps1')