package supabase

import (
	"os"

	"github.com/supabase-community/supabase-go"
)

var SupabaseClient *supabase.Client

func ConnectToSupabase() error {
	SUPABASE_URL := os.Getenv("SUPABASE_URL")
	SUPABASE_KEY := os.Getenv("SUPABASE_KEY")
	client, err := supabase.NewClient(SUPABASE_URL, SUPABASE_KEY, &supabase.ClientOptions{})

	if err != nil {
		return err
	}
	SupabaseClient = client
	return nil
}
