import re

def remove_all_ps1_comments(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Split into lines and process
    lines = content.split('\n')
    result = []
    in_string = False
    string_char = None
    in_heredoc = False
    heredoc_delimiter = '@"'

    for line in lines:
        new_line = ''
        i = 0
        while i < len(line):
            char = line[i]
            
            # Check for heredoc start
            if not in_string and not in_heredoc and i + 1 < len(line) and char == '@' and line[i+1] == '"':
                in_heredoc = True
                heredoc_delimiter = '@"'
                new_line += '@"'
                i += 2
                continue
            
            # Check for heredoc end
            if in_heredoc and char == '"' and (i == 0 or line[i-1] != '`') and i + 1 < len(line) and line[i+1] == '@':
                in_heredoc = False
                new_line += '"@'
                i += 2
                continue
            
            # Check for string start
            if not in_string and not in_heredoc and char in ('"', "'") and (i == 0 or line[i-1] != '`'):
                in_string = True
                string_char = char
                new_line += char
            # Check for string end
            elif in_string and char == string_char and (i == 0 or line[i-1] != '`'):
                in_string = False
                string_char = None
                new_line += char
            # Check for comment (only outside strings and heredocs)
            elif not in_string and not in_heredoc and char == '#':
                break
            else:
                new_line += char
            i += 1
        
        # For heredoc content, also remove comments
        if in_heredoc or (len(result) > 0 and '@"' in result[-1] and '"@' not in result[-1]):
            # Inside heredoc - remove # comments
            if '#' in new_line and not new_line.strip().startswith('#'):
                # Find # not in string
                in_str = False
                str_char = None
                clean_line = ''
                for j, c in enumerate(new_line):
                    if not in_str and c in ('"', "'") and (j == 0 or new_line[j-1] != '`'):
                        in_str = True
                        str_char = c
                        clean_line += c
                    elif in_str and c == str_char and (j == 0 or new_line[j-1] != '`'):
                        in_str = False
                        str_char = None
                        clean_line += c
                    elif not in_str and c == '#':
                        break
                    else:
                        clean_line += c
                new_line = clean_line.rstrip()
        
        result.append(new_line.rstrip())

    new_content = '\n'.join(result)
    with open(filepath, 'w') as f:
        f.write(new_content)

remove_all_ps1_comments('C:/Users/Elijah (AI)/Downloads/Github Projects/Simple/installer/install.ps1')
print('Done install.ps1')