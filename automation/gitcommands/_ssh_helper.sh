#!/usr/bin/env bash
set -euo pipefail

ensure_ssh_auth() {
  if ! command -v ssh-add >/dev/null 2>&1; then
    echo "ssh-add is not available. Install OpenSSH client tools."
    exit 1
  fi

  if ! ssh-add -l >/dev/null 2>&1; then
    if [[ -z "${SSH_AUTH_SOCK:-}" ]]; then
      eval "$(ssh-agent -s)" >/dev/null
    fi

    if ! ssh-add -l >/dev/null 2>&1; then
      local key_path="${HOME}/.ssh/id_ed25519"
      if [[ ! -f "$key_path" ]]; then
        echo "SSH key not found at $key_path"
        exit 1
      fi

      echo "No SSH key loaded in agent. Enter passphrase once to continue."
      ssh-add "$key_path"
    fi
  fi
}
