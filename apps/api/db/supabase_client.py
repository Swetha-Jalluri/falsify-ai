import os

from supabase import Client, create_client

_client: Client | None = None


def get_supabase() -> Client:
    """Return a singleton Supabase client.

    Raises RuntimeError on startup if the required env vars are absent so the
    problem is caught early rather than at the first request.
    """
    global _client
    if _client is None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        if not url or not key:
            raise RuntimeError(
                "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in your .env file."
            )
        _client = create_client(url, key)
    return _client
