#!/bin/bash
echo "Available tmux sessions:"
tmux list-sessions 2>/dev/null || echo "No active sessions"
echo ""
echo "Usage: tmux attach -t <session-name>"
echo ""
echo "Quick attach:"
echo "  Backend:   tmux attach -t 2fa-backend"
echo "  Frontend:  tmux attach -t 2fa-frontend"
