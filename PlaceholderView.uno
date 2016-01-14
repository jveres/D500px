using Uno;
using Uno.Graphics;
using Fuse;
using Fuse.Controls;

public class PlaceholderView: Placeholder
{
	public float ImageWidth { get; set; }
    public float ImageHeight { get; set; }

    protected override float2 GetContentSize(float2 fillSize, SizeFlags fillSet)
    {
    	base.GetContentSize(fillSize, fillSet);
        if (ImageWidth == 0 || ImageHeight == 0) return float2(0);
        else return float2(fillSize.X, ImageHeight * (fillSize.X / ImageWidth));
    }

    // FIXME: layout engine perhaps has a bug: sometimes orphaned views can be seen without content (but margins, paddings are visible -- taking place)
}