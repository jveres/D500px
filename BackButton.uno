using Fuse.Triggers;
using Fuse;

public class BackButton: Trigger
{

	protected override void OnRooted(Node n)
	{
		if (defined(Android))
		{
			Android.Runtime.NativeActivityHelper.OnBackPressed += OnBackButton;
			App.Current.Window.KeyPressed += Window_KeyPressed;
		}

		base.OnRooted(n);
	}

	protected override void OnUnrooted(Node n)
	{
		if (defined(Android))
		{
			Android.Runtime.NativeActivityHelper.OnBackPressed -= OnBackButton;
			App.Current.Window.KeyPressed -= Window_KeyPressed;
		}

		base.OnUnrooted(n);
	}

	void OnBackButton()
	{
		Pulse();
	}

	void Window_KeyPressed(object sender, Uno.Platform.KeyEventArgs args) {		
		if (args.Key == Uno.Platform.Key.BackButton) {			
			Pulse();
		}
	}

}