using Uno;
using Uno.Collections;
using Fuse;
using Fuse.Controls;
using Fuse.Elements;

public class GalleryPanel : Panel
{
	int _columnCount = 2;

	int LeastAt( float[] c )
	{
		float sz = c[0];
		int i = 0;
		
		for (int j=1; j < c.Length; j++)
		{
			if (c[j] < sz)
			{
				sz = c[j];
				i = j;
			}
		}
		
		return i;
	}
		
	float Max(float[] c)
	{
		var mx = c[0];
		for (int j=1; j < c.Length; j++)
			mx = Math.Max(mx, c[j]);
		return mx;
	}

	protected override float2 GetContentSize(float2 fillSize, SizeFlags fillSet)
	{
		return Arrange(Children, fillSize, fillSet);
	}

	protected override void ArrangePaddingBox(float2 fillSize, SizeFlags fillSet)
	{
		Arrange(Children, fillSize, fillSet, true);
	}

	float2 Arrange(IList<Node> nodes, float2 fillSize, SizeFlags fillSet, bool doArrange = false)
	{
		bool vert = true;		
		var at = new float[_columnCount];
		var colSize = (vert ? fillSize.X : fillSize.Y) / _columnCount;
		if ((vert && !fillSet.HasFlag(SizeFlags.X)) || (!vert && !fillSet.HasFlag(SizeFlags.Y)))
		{
			//assume all columns contain a max size element
			var mx = float2(0);
			foreach (var node in nodes)
			{
				mx = Math.Max( mx, node.GetMarginSize(float2(0), SizeFlags.None));
			}
			
			//fall-through to normal sizing
			fillSize = mx * _columnCount;
			fillSet = SizeFlags.Both;
		}
				
		foreach (var node in nodes)
		{
			var avs = float2(vert ? colSize : 0.0f, vert ? 0.0f : colSize);
			int col = LeastAt(at);
			float2 nsz;
			
			if (doArrange)
			{
				var pos = vert ?
					float2( col*colSize, at[col] ) :
					float2( at[col], col*colSize );
					
				nsz = node.ArrangeMarginBox(pos, avs, vert ? SizeFlags.X : SizeFlags.Y);
			}
			else
			{
				nsz = node.GetMarginSize(avs, vert ? SizeFlags.X : SizeFlags.Y);
			}
				
			at[col] += vert ? nsz.Y : nsz.X;
		}
		
		return vert ? float2(fillSize.X, Max(at)) : float2(Max(at), fillSize.Y);
	}
}
