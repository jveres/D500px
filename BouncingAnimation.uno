using Uno;
using Fuse;
using Fuse.Controls;
using Fuse.Gestures;
using Fuse.Triggers;

public enum BouncingAnimationRange
{
	SnapMin,
	SnapMax,
	Explicit
}

public class BouncingAnimation : Trigger
{
	//only Vertical or Horizontal are supported
	public ScrollDirections ScrollDirections { get; set; }

	BouncingAnimationRange _range = BouncingAnimationRange.SnapMin;
	public BouncingAnimationRange Range
	{
		get { return _range; }
		set
		{
			_range = value;
		}
	}

	public bool Inverse { get; set; }

	float _from, _to;
	bool _hasFrom, _hasTo;
	public float From
	{
		get { return _from; }
		set
		{
			_from = value;
			_hasFrom = true;
			_range = BouncingAnimationRange.Explicit;
		}
	}

	public float To
	{
		get { return _to; }
		set
		{
			_to = value;
			_hasTo = true;
			_range = BouncingAnimationRange.Explicit;
		}
	}

	ScrollView _scrollable;

	double ScrollProgress
	{
		get
		{
			float2 from, to;
			if (Range == BouncingAnimationRange.SnapMin)
			{
				from = _scrollable.MinScroll;
				to = from - 150f;
			}
			else if (Range == BouncingAnimationRange.SnapMax)
			{
				from = _scrollable.MaxScroll;
				to = from + 150f;
			}
			else
			{
				from = _hasFrom ? float2(From) : _scrollable.MinScroll;
				to = _hasTo ? float2(To) : _scrollable.MaxScroll;
			}
			var range2 = to - from;

			float at, range;

			if (ScrollDirections == ScrollDirections.Horizontal)
			{
				at = _scrollable.ScrollPosition.X - from.X;
				range = range2.X;
			}
			else if (ScrollDirections == ScrollDirections.Vertical)
			{
				at = _scrollable.ScrollPosition.Y - from.Y;
				range = range2.Y;
			}
			else
			{
				at = 0;
				range = 0;
			}

			if (Math.Abs(range) < float.ZeroTolerance)
				return 0;

			var p = Math.Clamp( at / range, 0, 1 );
			return Inverse ? 1-p : p;
		}
	}

	public BouncingAnimation()
	{
		ScrollDirections = ScrollDirections.Vertical;
	}

	protected override void OnRooted(Node parentNode)
	{
		base.OnRooted(parentNode);

		_scrollable = ParentNode.FindByType<ScrollView>();

		if (_scrollable != null)
		{
			_scrollable.ScrollPositionChanged += OnScrollPositionChanged;
			BypassSeek(ScrollProgress);
		}
	}

	protected override void OnUnrooted(Node parentNode)
	{
		if (_scrollable != null)
		{
			_scrollable.ScrollPositionChanged -= OnScrollPositionChanged;
			_scrollable = null;
		}
		base.OnUnrooted(parentNode);
	}

	void OnScrollPositionChanged(object sender, Uno.EventArgs args)
	{
		Seek(ScrollProgress);
	}
}
