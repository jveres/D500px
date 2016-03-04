using Uno;
using Uno.UX;
using Fuse;
using Fuse.Resources;
using Fuse.Triggers.Actions;

public class Assign : TriggerAction
{
	public ResourceObject Target { get; set; }
	public object Value { get; set; }
	
	protected override void Perform(Node target)
	{
		var t = Target;
		if (t != null)
			t.Value = Value;
	}
}