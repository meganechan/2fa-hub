#!/bin/bash
cd /Users/tony/Jobs/2fa-hub/frontend
SESSION_NAME="2fa-frontend"

if tmux has-session -t $SESSION_NAME 2>/dev/null; then
    echo "Session $SESSION_NAME already exists. Attaching..."
    tmux attach -t $SESSION_NAME
else
    echo "Starting frontend in new tmux session: $SESSION_NAME"
    tmux new-session -d -s $SESSION_NAME
    tmux send-keys -t $SESSION_NAME "npm run dev" C-m
    echo "Frontend started in session: $SESSION_NAME"
    echo "Attach with: tmux attach -t $SESSION_NAME"
fi
