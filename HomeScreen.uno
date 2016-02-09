using Uno;
using Uno.Collections;
using Fuse;
using Android.android.os;
using Android.android.app;
using Android.android.content;
using Android.android.net;
using Android.Base;
using Fuse.Triggers.Actions;

public class HomeScreen : TriggerAction
{
	protected override void Perform(Node target)
	{
		if defined(Android)
		{
			Activity.GetAppActivity().finish();
		}
	}
}