using Uno;
using Uno.UX;
using Fuse;
using Fuse.Elements;
using Fuse.Resources;
using Fuse.Triggers.Actions;

public class Opacity : TriggerAction
{
	public ResourceObject Target { get; set; }
	public float Value { get; set; }
	
	protected override void Perform(Node target)
	{
		var t = Target;
		if (t != null)
		{
			Element el = t.Value as Element;
			if (el != null)
				el.Opacity = Value;
		}
	}
}